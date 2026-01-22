// /lib/providers/youtube/YoutubePlaylistProviderImpl.ts

import { CACHE_MESSAGES, NORMALIZED_PLAYLISTS_TTL_SECONDS, PROVIDER_CALLERS, YOUTUBE } from "@/lib/cache/constants";
import { PlaylistProvider } from "../PlaylistProvider";
import { Result, NormalizedPlaylist } from "@/lib/types";
import { getUserCacheKey, youtubeCache } from "@/lib/youtube/cache";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { getYoutubeUserPlaylists } from "@/lib/youtube/playlists";
import { isMusicPlaylist } from "@/lib/youtube/musicFilter";

export class YoutubePlaylistProviderImpl implements PlaylistProvider {
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

        console.log(`${PROVIDER_CALLERS.YOUTUBE_PLAYLISTS} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

        // 3. Fetch from API
        const youtubePlaylistsResult = await getYoutubeUserPlaylists();
    
        if (!youtubePlaylistsResult.ok) {
            return {
                ok: false,
                error: youtubePlaylistsResult.error,
            }
        }
    
        const youtubePlaylists = youtubePlaylistsResult.data
            .filter((playlist) => playlist.id != null); // Filter out playlists without IDs
    
        const checks: Array<{ playlist: any; isMusic: boolean }> = [];
    
        for (const playlist of youtubePlaylists) {
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
}