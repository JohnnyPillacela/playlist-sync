// /lib/providers/spotify/SpotifyTrackProviderImpl.ts

import { NormalizedTrack, Result } from "@/lib/types";
import { TrackProvider } from "../TrackProvider";
import { getUserCacheKey, spotifyCache } from "@/lib/spotify/cache";
import { CACHE_MESSAGES, PLAYLISTS_TTL_SECONDS, PROVIDER_CALLERS, SPOTIFY } from "@/lib/cache/constants";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { MaxInt, Track } from "@spotify/web-api-ts-sdk";
import { getServerSDK } from "@/lib/spotify/sdk";

export class SpotifyTrackProviderImpl implements TrackProvider {
    async getPlaylistTracks(playlistId: string): Promise<Result<NormalizedTrack[]>> {
        const userKey = await getUserCacheKey();
        const cacheKey = `${SPOTIFY.NORMALIZED_PLAYLIST_TRACKS_NAMESPACE}:${userKey}`;
    
        const cachedTracks = await getFromCaches<NormalizedTrack[]>(cacheKey, PROVIDER_CALLERS.SPOTIFY_PLAYLIST_TRACKS, spotifyCache.normalizedTracks);
        if (cachedTracks) {
            return {
                ok: true,
                data: cachedTracks
            }
        }
    
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLIST_TRACKS} ${CACHE_MESSAGES.CHECKING_RAW_CACHE}`);

        const rawTracksResult = await this.getRawPlaylistTracksFromAPI(playlistId);
        if (!rawTracksResult.ok) {
            return {
                ok: false,
                error: rawTracksResult.error
            }
        }
        const rawTracks = rawTracksResult.data;

        const normalizedTracks: NormalizedTrack[] = rawTracks.map((track) => {
            return {
                id: track.id,
                name: track.name,
                artists: track.artists.map((artist) => artist.name),
                thumbnailUrl: track.album.images[0].url,
                album: track.album.name,
                duration: track.duration_ms,
                provider: 'spotify'
            }
        })
    
        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.SPOTIFY_PLAYLIST_TRACKS, spotifyCache.normalizedTracks, normalizedTracks, PLAYLISTS_TTL_SECONDS);
    
        console.log(`${PROVIDER_CALLERS.SPOTIFY_PLAYLIST_TRACKS} Cached ${normalizedTracks.length} tracks`);
    
        return {
            ok: true,
            data: normalizedTracks
        }
    }

    // ✅ Private helper - encapsulates API call
    private async getRawPlaylistTracksFromAPI(playlistId: string): Promise<Result<Track[]>> {
        const sdkResult = await getServerSDK();
        if (!sdkResult.ok) {
            return {
                ok: false,
                error: sdkResult.error
            }
        }
        const sdk = sdkResult.data;
        const allTracks: Track[] = [];
        let offset = 0;
        let limit = 100;
    
        while (true) {
            const page = await sdk.playlists.getPlaylistItems(
                playlistId,
                undefined,
                undefined,
                limit as MaxInt<50>,
                offset,
            );
    
            // Add tracks from this page to the allTracks array
            const tracks = page.items
                .map(item => item.track as Track)
                .filter(track => track !== null);
    
            allTracks.push(...tracks);
    
            if (!page.next) {
                break;
            }
    
            offset += limit;
        }

        return {
            ok: true,
            data: allTracks
        }
    }
}