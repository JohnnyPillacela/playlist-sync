// /lib/providers/spotify/SpotifyPlaylistProviderImpl.ts

import { Result, NormalizedPlaylist } from "@/lib/types";
import { PlaylistProvider } from "../PlaylistProvider";
import { getSpotifyUserPlaylists } from "@/lib/spotify/playlists";
import { getUserCacheKey, spotifyCache } from "@/lib/spotify/cache";
import { CACHE_MESSAGES, NORMALIZED_PLAYLISTS_TTL_SECONDS, PROVIDER_CALLERS, SPOTIFY } from "@/lib/cache/constants";
import { getFromCaches, setCaches } from "@/lib/cache/layers";

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

        const spotifyPlaylistsResult = await getSpotifyUserPlaylists();

        if (!spotifyPlaylistsResult.ok) {
            return {
                ok: false,
                error: spotifyPlaylistsResult.error
            }
        }
    
        const spotifyPlaylists = spotifyPlaylistsResult.data;

        const normalizedPlaylists: NormalizedPlaylist[] = spotifyPlaylists.map((playlist) => {
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
}

