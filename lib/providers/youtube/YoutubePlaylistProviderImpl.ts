// /lib/providers/youtube/YoutubePlaylistProviderImpl.ts

import { CACHE_MESSAGES, NORMALIZED_PLAYLISTS_TTL_SECONDS, PLAYLISTS_TTL_SECONDS, PROVIDER_CALLERS, YOUTUBE } from "@/lib/cache/constants";
import { AddTracksResult, PlaylistCreationResult, PlaylistProvider, TrackIdAndNameMapping } from "../PlaylistProvider";
import { Result, NormalizedPlaylist, SDK_ERRORS } from "@/lib/types";
import { getUserCacheKey, youtubeCache } from "@/lib/youtube/cache";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { isMusicPlaylist } from "@/lib/youtube/musicFilter";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { getYoutubeSDK } from "@/lib/youtube/sdk";
import { handleYouTubeAPIError } from "@/lib/youtube/errorHandler";

export class YoutubePlaylistProviderImpl implements PlaylistProvider {
    private sdk: youtube_v3.Youtube | null = null;

    async getUserPlaylists(): Promise<Result<NormalizedPlaylist[]>> {
        const userKey = await getUserCacheKey();
        const cacheKey = `${YOUTUBE.NORMALIZED_PLAYLISTS_NAMESPACE}:${userKey}`;

        // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
        const cachedNormalizedPlaylists = await getFromCaches<NormalizedPlaylist[]>(
            cacheKey,
            PROVIDER_CALLERS.YOUTUBE_PLAYLISTS,
            youtubeCache.normalizedPlaylists
        );

        if (cachedNormalizedPlaylists) {
            return {
                ok: true,
                data: cachedNormalizedPlaylists,
            }
        }

        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLISTS} ${CACHE_MESSAGES.CHECKING_RAW_CACHE}`);

        // 3. Fetch from API
        const rawPlaylistsResult = await this.getRawPlaylistsFromAPI();
    
        if (!rawPlaylistsResult.ok) {
            return {
                ok: false,
                error: rawPlaylistsResult.error,
            }
        }
    
        const rawPlaylists = rawPlaylistsResult.data
            .filter((playlist) => playlist.id != null); // Filter out playlists without IDs
    
        const checks: Array<{ playlist: any; isMusic: boolean }> = [];
    
        for (const playlist of rawPlaylists) {
            const id = playlist.id!;
            const res = await isMusicPlaylist(id, {
                maxItemsToInspect: 5,
                minMusicRatio: 0.7,
                minInspected: 3,
            });
    
            if (!res.ok) {
                // Don't hide errors as "not music" — bubble them up
                return { ok: false, error: res.error };
            }
    
            checks.push({ playlist, isMusic: res.data });
        }
    
        const normalizedPlaylists: NormalizedPlaylist[] = checks
            .filter((playlist) => playlist.isMusic)
            .map(({ playlist }) => ({
                id: playlist.id!,
                name: playlist.snippet?.title || "Untitled Playlist",
                trackCount: playlist.contentDetails?.itemCount || 0,
                thumbnailUrl: playlist.snippet?.thumbnails?.default?.url || "Undefined",
                provider: "youtube-music",
            }));
    
        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.YOUTUBE_PLAYLISTS, youtubeCache.normalizedPlaylists, normalizedPlaylists, NORMALIZED_PLAYLISTS_TTL_SECONDS);
    
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLISTS} Cached ${normalizedPlaylists.length} normalized playlists`);
    
        return {
            ok: true,
            data: normalizedPlaylists,
        }        
        
    }

    async createPlaylist(name: string, description?: string): Promise<Result<PlaylistCreationResult>> {
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_CREATE} Creating playlist ${name}`);

        const youtubeSDKResult = await getYoutubeSDK();
        if (!youtubeSDKResult.ok) {
            return { ok: false, error: youtubeSDKResult.error };
        }
        
        const sdk = youtubeSDKResult.data;

        try {
            const response = await sdk.playlists.insert({
                part: ['snippet', 'status'],
                requestBody: {
                    snippet: {
                        title: name,
                        description: description || `Synced from Spotify on ${new Date().toLocaleDateString()}`,
                    },
                    status: {
                        privacyStatus: 'private', // Default to private for safety
                    },
                },
            });

            const playlistId = response.data.id;
            if (!playlistId) {
                return { ok: false, error: SDK_ERRORS.YOUTUBE_PLAYLIST_CREATION_FAILED };
            }

            console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_CREATE} Playlist created with ID ${playlistId}`);

            return {
                ok: true,
                data: {
                    id: playlistId,
                    url: `https://www.youtube.com/playlist?list=${playlistId}`,
                    operation: 'created',
                },
            }
        } catch (error: any) {
            return handleYouTubeAPIError(error);
        }
    }

    async getPlaylist(playlistId: string): Promise<Result<NormalizedPlaylist | null>> {
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_GET} Getting playlist ${playlistId}`);

        const youtubeSDKResult = await this.getSDK();
        if (!youtubeSDKResult.ok) {
            return { ok: false, error: youtubeSDKResult.error };
        }
        let response: youtube_v3.Schema$PlaylistListResponse | null = null;

        try {
            const sdk = youtubeSDKResult.data;

            response = (await sdk.playlists.list({
                part: ['snippet', 'contentDetails'],
                id: [playlistId],
            })).data;
        } catch (error: any) {
            return handleYouTubeAPIError(error);
        }

        if (!response) {
            return { ok: false, error: SDK_ERRORS.YOUTUBE_PLAYLIST_GET_FAILED };
        }
        const playlist = response.items?.[0];
        if (!playlist) {
            return { ok: true, data: null };
        }

        return {
            ok: true,
            data: {
                id: playlist.id ?? '',
                name: playlist.snippet?.title || "Untitled Playlist",
                trackCount: playlist.contentDetails?.itemCount || 0,
                thumbnailUrl: playlist.snippet?.thumbnails?.default?.url || "Undefined",
                provider: "youtube-music",
            },
        }
    }

    async addTracksToPlaylist(playlistId: string, trackIdsAndNames: TrackIdAndNameMapping[]): Promise<Result<AddTracksResult>> {
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_ADD_TRACKS} Adding tracks to playlist ${playlistId}`);

        const youtubeSDKResult = await this.getSDK();
        if (!youtubeSDKResult.ok) {
            return { ok: false, error: youtubeSDKResult.error };
        }
        
        const sdk = youtubeSDKResult.data;
        const failed: Array<{ trackId: string, trackName: string, error: string }> = [];
        let addedCount = 0;

        // Add tracks to playlist sequentially
        // TODO: Look into batching if yotuube API supports it
        for (const {trackId, trackName} of trackIdsAndNames) {
            try {
                await sdk.playlistItems.insert({
                    part: ['snippet'],
                    requestBody: {
                        snippet: {
                            playlistId: playlistId,
                            resourceId: {
                                kind: 'youtube#video',
                                videoId: trackId,
                            },
                        },
                    }
                });
                addedCount++;
            } catch (error: any) {
                console.error(`${SDK_ERRORS.YOUTUBE_PLAYLIST_ADD_TRACKS_FAILED} Error adding track ${trackId} to playlist ${playlistId}: ${error.message}`);
                failed.push({
                    trackId: trackId,
                    trackName: trackName,
                    error: error.message || "Unknown error",
                })
            }
        }
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_ADD_TRACKS} Added ${addedCount}/${trackIdsAndNames.length} tracks to playlist ${playlistId}`);

        return {
            ok: true,
            data: {
                addedCount: addedCount,
                failed: failed,
            },
        }
    }

    private async getRawPlaylistsFromAPI(): Promise<Result<youtube_v3.Schema$Playlist[]>> {
        const userKey = await getUserCacheKey();
        const cacheKey = `${YOUTUBE.PLAYLIST_NAMESPACE}:${userKey}`;
    
        // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
        const cachedPlaylists = await getFromCaches<youtube_v3.Schema$Playlist[]>(
            cacheKey,
            PROVIDER_CALLERS.YOUTUBE_PLAYLISTS_RAW,
            youtubeCache.playlists
        );
        if (cachedPlaylists) {
            return {
                ok: true,
                data: cachedPlaylists,
            }
        }
    
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLISTS_RAW} ${CACHE_MESSAGES.FETCHING_FROM_API}`);
    
        // 3. Fetch from API
        const youtubeSDKResult: Result<youtube_v3.Youtube> = await getYoutubeSDK();
        if (!youtubeSDKResult.ok) {
            return {
                ok: false,
                error: youtubeSDKResult.error,
            }
        }
    
        const youtubeSdk: youtube_v3.Youtube = youtubeSDKResult.data;
        const youtubePlaylists: youtube_v3.Schema$Playlist[] = [];
        let pageToken: string | undefined = undefined;
    
        // Loop through all pages of playlists
        while (true) {
            let response: youtube_v3.Schema$PlaylistListResponse;
            try {
                response = (await youtubeSdk.playlists.list({
                    part: ['snippet', 'contentDetails'],
                    mine: true,
                    maxResults: 50,
                    pageToken: pageToken,
                })).data;
            } catch (error: any) {
                return handleYouTubeAPIError(error);
            }
    
            // Add items from this page to the youtubePlaylists array
            if (response.items) {
                youtubePlaylists.push(...response.items);
            }
    
            // Check if there are more pages
            if (!response.nextPageToken) {
                break;
            }
    
            pageToken = response.nextPageToken;
        }
    
        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.YOUTUBE_PLAYLISTS_RAW, youtubeCache.playlists, youtubePlaylists, PLAYLISTS_TTL_SECONDS);
    
        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLISTS_RAW} Cached ${youtubePlaylists.length} playlists`);
    
        return {
            ok: true,
            data: youtubePlaylists,
        }
    }

    private async getSDK(): Promise<Result<youtube_v3.Youtube>> {
        if (this.sdk) {
            return {
                ok: true,
                data: this.sdk,
            }
        }

        const youtubeSDKResult = await getYoutubeSDK();

        if (youtubeSDKResult.ok) {
            this.sdk = youtubeSDKResult.data;
        }

        return youtubeSDKResult;
    }

}