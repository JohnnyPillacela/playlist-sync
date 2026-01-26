// /lib/providers/spotify/SpotifyPlaylistProviderImpl.ts

import { Result, NormalizedPlaylist, SDK_ERRORS } from "@/lib/types";
import { AddTracksResult, PlaylistCreationResult, PlaylistProvider, TrackIdAndNameMapping } from "../PlaylistProvider";
import { getUserCacheKey, spotifyCache } from "@/lib/spotify/cache";
import { CACHE_MESSAGES, NORMALIZED_PLAYLISTS_TTL_SECONDS, PLAYLISTS_TTL_SECONDS, PROVIDER_CALLERS, SPOTIFY } from "@/lib/cache/constants";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { Page, SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { getServerSDK } from "@/lib/spotify/sdk";

export class SpotifyPlaylistProviderImpl implements PlaylistProvider {

    async getUserPlaylists(): Promise<Result<NormalizedPlaylist[]>> {
        const userKey = await getUserCacheKey();
        const cacheKey = `${SPOTIFY.NORMALIZED_PLAYLISTS_NAMESPACE}:${userKey}`;

        // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
        const cachedNormalizedPlaylists = await getFromCaches<NormalizedPlaylist[]>(
            cacheKey,
            PROVIDER_CALLERS.SPOTIFY_PLAYLISTS,
            spotifyCache.normalizedPlaylists,
        );
        if (cachedNormalizedPlaylists) {
            return {
                ok: true,
                data: cachedNormalizedPlaylists,
            }
        }
    
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLISTS} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

        const rawPlaylistsResult = await this.getRawPlaylistsFromAPI();

        if (!rawPlaylistsResult.ok) {
            return {
                ok: false,
                error: rawPlaylistsResult.error
            }
        }
    
        const rawPlaylists = rawPlaylistsResult.data;

        const normalizedPlaylists: NormalizedPlaylist[] = rawPlaylists.map((playlist) => {
            return {
                id: playlist.id,
                name: playlist.name,
                trackCount: playlist.tracks?.total || 0,
                thumbnailUrl: playlist.images?.[0]?.url || "",
                provider: 'spotify'
            }
        })
    
        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.SPOTIFY_PLAYLISTS, spotifyCache.normalizedPlaylists, normalizedPlaylists, NORMALIZED_PLAYLISTS_TTL_SECONDS);
    
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLISTS} Cached ${normalizedPlaylists.length} normalized playlists`);
    
    
        return {
            ok: true,
            data: normalizedPlaylists
        }

    }

    async createPlaylist(name: string, description?: string): Promise<Result<PlaylistCreationResult>> {
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLIST_CREATE} Creating playlist ${name}`);

        // TODO: Implement spotify playlist creation

        return {
            ok: false,
            error: SDK_ERRORS.SPOTIFY_PLAYLIST_CREATE_FAILED,
        }
    }

    async addTracksToPlaylist(playlistId: string, trackIdsAndNames: TrackIdAndNameMapping[]): Promise<Result<AddTracksResult>> {
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLIST_ADD_TRACKS} Adding tracks to playlist ${playlistId}`);

        // TODO: Implement spotify playlist add tracks

        return {
            ok: false,
            error: SDK_ERRORS.SPOTIFY_PLAYLIST_ADD_TRACKS_FAILED,
        }
    }

    // ✅ Private helper - encapsulates API call
    private async getRawPlaylistsFromAPI(): Promise<Result<SimplifiedPlaylist[]>> {
        const userKey = await getUserCacheKey();
        const cacheKey = `${SPOTIFY.PLAYLIST_NAMESPACE}:${userKey}`;
    
        const cachedPlaylists = await getFromCaches<SimplifiedPlaylist[]>(cacheKey, PROVIDER_CALLERS.SPOTIFY_PLAYLISTS_RAW, spotifyCache.playlists);
        if (cachedPlaylists) {
            return {
                ok: true,
                data: cachedPlaylists
            }
        }
    
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLISTS_RAW} ${CACHE_MESSAGES.FETCHING_FROM_API}`);
    
        const sdkResult = await getServerSDK();
        if (!sdkResult.ok) {
            return {
                ok: false,
                error: sdkResult.error
            }
        }
    
        const sdk = sdkResult.data;
    
        const response: Page<SimplifiedPlaylist> = await sdk.currentUser.playlists.playlists(50);
    
        const simplifiedPlaylists: SimplifiedPlaylist[] = response.items;
    
        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.SPOTIFY_PLAYLISTS_RAW, spotifyCache.playlists, simplifiedPlaylists, PLAYLISTS_TTL_SECONDS);
    
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLISTS_RAW} Cached ${simplifiedPlaylists.length} RAW playlists`);
    
        return {
            ok: true,
            data: simplifiedPlaylists
        }
    }
}

