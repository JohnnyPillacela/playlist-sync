// /lib/providers/youtube/YoutubeTrackProvider.ts

import { NormalizedTrack, Result } from "@/lib/types";
import { TrackProvider } from "../TrackProvider";
import { getUserCacheKey, youtubeCache } from "@/lib/youtube/cache";
import { CACHE_MESSAGES, PLAYLISTS_TTL_SECONDS, PROVIDER_CALLERS, YOUTUBE } from "@/lib/cache/constants";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { getYoutubeSDK } from "@/lib/youtube/sdk";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { handleYouTubeAPIError } from "@/lib/youtube/errorHandler";


export class YoutubeTrackProviderImpl implements TrackProvider {
    async getPlaylistTracks(playlistId: string): Promise<Result<NormalizedTrack[]>> {
        const userKey = await getUserCacheKey();
        const cacheKey = `${YOUTUBE.NORMALIZED_PLAYLIST_TRACKS_NAMESPACE}:${userKey}:${playlistId}`;

        const cachedTracks = await getFromCaches<NormalizedTrack[]>(cacheKey, PROVIDER_CALLERS.YOUTUBE_PLAYLIST_TRACKS, youtubeCache.normalizedTracks);
        if (cachedTracks) {
            return {
                ok: true,
                data: cachedTracks
            }
        }

        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_TRACKS} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

        const rawTracksResult = await this.getRawPlaylistTracksFromAPI(playlistId);
        if (!rawTracksResult.ok) {
            return {
                ok: false,
                error: rawTracksResult.error
            }
        }
        const rawTracks: youtube_v3.Schema$PlaylistItem[] = rawTracksResult.data;

        const normalizedTracks: NormalizedTrack[] = rawTracks.map((track) => {
            // Try to parse duration as number, fallback to 0 if not present or invalid
            let duration = 0;
            const endAt = track.contentDetails?.endAt;
            if (typeof endAt === 'string') {
                const parsed = Number(endAt);
                if (!isNaN(parsed)) {
                    duration = parsed;
                }
            } else if (typeof endAt === 'number') {
                duration = endAt;
            }

            return {
                id: track.contentDetails?.videoId ?? '',
                name: track.snippet?.title ?? '',
                artists: [track.snippet?.videoOwnerChannelTitle ?? 'None Given - Check YouTube'],
                thumbnailUrl: track.snippet?.thumbnails?.default?.url ?? '',
                album: track.snippet?.videoOwnerChannelTitle ?? '',
                duration,
                provider: 'youtube-music'
            }
        })

        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.YOUTUBE_PLAYLIST_TRACKS, youtubeCache.normalizedTracks, normalizedTracks, PLAYLISTS_TTL_SECONDS);

        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLIST_TRACKS} Cached ${normalizedTracks.length} tracks`);

        return {
            ok: true,
            data: normalizedTracks
        }

    }

    // ✅ Private helper - encapsulates API call
    private async getRawPlaylistTracksFromAPI(playlistId: string): Promise<Result<youtube_v3.Schema$PlaylistItem[]>> {
        const sdkResult = await getYoutubeSDK();
        if (!sdkResult.ok) {
            return {
                ok: false,
                error: sdkResult.error
            }
        }
        const sdk = sdkResult.data;
        const allTracks: youtube_v3.Schema$PlaylistItem[] = [];
        let pageToken: string | undefined = undefined;

        // Loop through all pages
        while (true) {
            try {
                const response: youtube_v3.Schema$PlaylistItemListResponse = (await sdk.playlistItems.list({
                    part: ['snippet', 'contentDetails'],
                    playlistId: playlistId,
                    maxResults: 50, // Max allowed by YouTube API
                    pageToken: pageToken
                })).data;

                // Add items from this page
                if (response.items) {
                    allTracks.push(...response.items);
                }

                // Check if there are more pages
                if (!response.nextPageToken) {
                    break; // No more pages
                }

                pageToken = response.nextPageToken;

            } catch (error: any) {
                return handleYouTubeAPIError(error);
            }
        }

        return {
            ok: true,
            data: allTracks
        }
    }
}