// /lib/transfer/SpotifyToYoutubeTransfer.ts

import { PLAYLIST_MAPPING_TTL_SECONDS, SPOTIFY } from "../cache/constants";
import { getFromCaches, setCaches } from "../cache/layers";
import { AddTracksResult, PlaylistCreationResult, PlaylistProvider, TrackIdAndNameMapping } from "../providers/PlaylistProvider";
import { SearchProvider, SearchResult, UnmatchedTrack } from "../providers/SearchProvider";
import { TrackProvider } from "../providers/TrackProvider";
import { getUserCacheKey, spotifyCache, SpotifyPlaylistMapping } from "../spotify/cache";
import { NormalizedTrack, Result, SDK_ERRORS } from "../types";
import { getYoutubeCacheStats } from "../youtube/cache";
import { findMatchingTrack } from "./matching";
import { TransferRequest, TransferResponse, TransferService } from "./TransferService";

export class SpotifyToYoutubeTransfer implements TransferService {
    constructor(
        private readonly spotifyTrackProvider: TrackProvider,
        private readonly youtubeTrackProvider: TrackProvider,
        private readonly youtubeSearchProvider: SearchProvider,
        private readonly youtubePlaylistProvider: PlaylistProvider,
    ) { }

    async transfer(request: TransferRequest): Promise<Result<TransferResponse>> {
        const startTime = Date.now();

        // 1. Fetch source tracks from Spotify
        console.log(`[SpotifyToYoutubeTransfer] 1. Fetching source tracks from Spotify...`);
        const tracksResult = await this.spotifyTrackProvider.getPlaylistTracks(request.playlistId);
        if (!tracksResult.ok) {
            return { ok: false, error: tracksResult.error };
        }

        const tracks = tracksResult.data;

        // 2. Match tracks to YouTube
        console.log(`[SpotifyToYoutubeTransfer] 2. Matching Spotify Tracks to YouTube...`);
        const { matchedTracks, unmatchedTracks } = await this.matchTracks(tracks);
        const searchCacheStats = getYoutubeCacheStats().search;
        console.log(
            `[SpotifyToYoutubeTransfer] 2. Matched ${matchedTracks.length}/${tracks.length} tracks ` +
            `(Cache: ${searchCacheStats.hits} hits, ${searchCacheStats.misses} misses, ${searchCacheStats.hitRate.toFixed(1)}% hit rate)`
        );

        // 3. Create or update target playlist on YouTube
        console.log(`[SpotifyToYoutubeTransfer] 3. Creating or updating target playlist on YouTube...`);

        const playlistCreationResult: Result<PlaylistCreationResult> = await this.findOrCreatePlaylist(request.playlistId, request.playlistName);
        if (!playlistCreationResult.ok) {
            return { ok: false, error: playlistCreationResult.error };
        }

        console.log(`[SpotifyToYoutubeTransfer] 3. Playlist creation result: ${JSON.stringify(playlistCreationResult.data.operation)}`);
        const { id: playlistId, url: playlistUrl, operation: playlistOperation } = playlistCreationResult.data;

        // ✅ Only fetch existing tracks if playlist was updated (not newly created)
        let existingPlaylistTracks: NormalizedTrack[] = [];

        if (playlistOperation === 'updated') {
            const existingPlaylistTracksResult: Result<NormalizedTrack[]> = await this.youtubeTrackProvider.getPlaylistTracks(playlistId);
            if (!existingPlaylistTracksResult.ok) {
                return { ok: false, error: existingPlaylistTracksResult.error };
            }

            existingPlaylistTracks = existingPlaylistTracksResult.data;
        } else {
            // Playlist just created - it's empty, no need to check
            console.log(`[SpotifyToYoutubeTransfer] 3. New playlist created, no existing tracks to check`);
        }

        // Then filter out tracks that already exist
        const newTracks = matchedTracks.filter(track =>
            !existingPlaylistTracks.some(existing => existing.id === track.id)
        );

        // 4. Add matched tracks to target playlist
        console.log(`[SpotifyToYoutubeTransfer] 4. Adding matched tracks to target playlist... ${newTracks.length} tracks`);
        const trackIdsAndNames: TrackIdAndNameMapping[] = newTracks.map((track) => ({
            trackId: track.id,
            trackName: track.title,
        }));

        const addTracksResult: Result<AddTracksResult> = await this.youtubePlaylistProvider.addTracksToPlaylist(playlistId, trackIdsAndNames);
        if (!addTracksResult.ok) {
            return { ok: false, error: addTracksResult.error };
        }

        // 5. Store mapping in cache for future lookups
        await this.storePlaylisMapping(request.playlistId, playlistId, addTracksResult.data.addedCount);

        const cacheStats = getYoutubeCacheStats();

        console.log(`[SpotifyToYoutubeTransfer] 5. Transfer completed successfully in ${Date.now() - startTime}ms`);

        return {
            ok: true,
            data: {
                success: true,
                playlistId: playlistId,
                playlistUrl: playlistUrl,
                playlistOperation: playlistOperation,
                tracksTotal: tracks.length,
                tracksMatched: matchedTracks.length,
                tracksAdded: addTracksResult.data.addedCount,
                matchedTracks: matchedTracks,
                unmatchedTracks: unmatchedTracks, // Spotify songs not available on YouTube
                failedToAdd: addTracksResult.data.failed.map((failed) => ({
                    trackId: failed.trackId,
                    trackName: failed.trackName,
                    error: failed.error,
                })), // Failed to add tracks to YouTube playlist
                duration: Date.now() - startTime,
                cacheStats: cacheStats.search,
            }
        }

    }

    private async matchTracks(tracks: NormalizedTrack[]): Promise<{
        matchedTracks: SearchResult[];
        unmatchedTracks: UnmatchedTrack[];
    }> {
        const matchedTracks: SearchResult[] = [];
        const unmatchedTracks: UnmatchedTrack[] = [];

        for (const track of tracks) {
            const matchResult = await findMatchingTrack(
                track,
                this.youtubeSearchProvider,
                { confidenceThreshold: 0.7, prioritizeAudio: true }
            );

            if (!matchResult.ok) {
                unmatchedTracks.push({
                    name: track.name,
                    artists: track.artists,
                    reason: SDK_ERRORS.YOUTUBE_API_ERROR
                });
                continue;
            }

            const { matched, reason } = matchResult.data;
            if (matched) {
                matchedTracks.push(matched);
            } else {
                unmatchedTracks.push({
                    name: track.name,
                    artists: track.artists,
                    reason: reason!
                });
            }
        }

        return { matchedTracks, unmatchedTracks };
    }

    // NEW: Helper method for deduplication
    private async findOrCreatePlaylist(
        spotifyPlaylistId: string,
        playlistName: string
    ): Promise<Result<PlaylistCreationResult>> {

        const NAMESPACE = '[SpotifyToYoutubeTransfer - findOrCreatePlaylist()]';

        // 1. Check cache for existing mapping
        const userKey = await getUserCacheKey();
        const cacheKey = `${SPOTIFY.PLAYLIST_MAP_NAMESPACE}:${userKey}:${spotifyPlaylistId}`;

        const cachedMapping = await getFromCaches<SpotifyPlaylistMapping>(
            cacheKey,
            NAMESPACE,
            spotifyCache.playlistMap
        );

        // ✅ Better - only call if cached mapping exists
        if (cachedMapping) {

            // Check if cached playlist still exists on YouTube
            const playlistExistsResult = await this.youtubePlaylistProvider.getPlaylist(
                cachedMapping.youtubePlaylistId
            );

            if (!playlistExistsResult.ok) {
                // API error - log and fall through to create new playlist
                console.log(`[SpotifyToYoutubeTransfer] Error checking playlist: ${playlistExistsResult.error}`);
            } else if (playlistExistsResult.data !== null) {
                // Playlist exists - use it!
                console.log(`[SpotifyToYoutubeTransfer] Verified cached playlist exists`);
                return {
                    ok: true,
                    data: {
                        id: cachedMapping.youtubePlaylistId,
                        url: `https://music.youtube.com/playlist?list=${cachedMapping.youtubePlaylistId}`,
                        operation: 'updated'
                    }
                };
            } else {
                // Playlist deleted - log and fall through to create new
                console.log(`[SpotifyToYoutubeTransfer] Cached playlist no longer exists`);
            }
        }

        // 3. Create new playlist
        console.log(`[SpotifyToYoutubeTransfer] Creating new playlist: ${playlistName}`);
        const createResult = await this.youtubePlaylistProvider.createPlaylist(
            playlistName,
            `Synced from Spotify on ${new Date().toLocaleDateString()}`
        );

        if (!createResult.ok) {
            return { ok: false, error: createResult.error };
        }

        return createResult;
    }

    // NEW: Store mapping in cache
    private async storePlaylisMapping(
        spotifyPlaylistId: string,
        youtubePlaylistId: string,
        trackCount: number
    ): Promise<void> {
        const NAMESPACE = '[SpotifyToYoutubeTransfer - storePlaylisMapping()]';

        const userKey = await getUserCacheKey();
        const cacheKey = `${SPOTIFY.PLAYLIST_MAP_NAMESPACE}:${userKey}:${spotifyPlaylistId}`;

        const mapping: SpotifyPlaylistMapping = {
            youtubePlaylistId,
            lastSyncedAt: Date.now(),
            trackCount
        };

        await setCaches(
            cacheKey,
            NAMESPACE,
            spotifyCache.playlistMap,
            mapping,
            PLAYLIST_MAPPING_TTL_SECONDS
        );

        console.log(`[SpotifyToYoutubeTransfer] Stored mapping: ${spotifyPlaylistId} -> ${youtubePlaylistId}`);
    }
}