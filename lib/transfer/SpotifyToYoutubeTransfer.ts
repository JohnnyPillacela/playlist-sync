// /lib/transfer/SpotifyToYoutubeTransfer.ts

import { PlaylistCreationResult, PlaylistProvider } from "../providers/PlaylistProvider";
import { SearchProvider, SearchResult, UnmatchedTrack } from "../providers/SearchProvider";
import { TrackProvider } from "../providers/TrackProvider";
import { NormalizedTrack, Result, SDK_ERRORS } from "../types";
import { getYoutubeCacheStats } from "../youtube/cache";
import { findMatchingTrack } from "./matching";
import { TransferRequest, TransferResponse, TransferService } from "./TransferService";

export class SpotifyToYoutubeTransfer implements TransferService {
    constructor(
        private readonly spotifyTrackProvider: TrackProvider,
        private readonly youtubeSearchProvider: SearchProvider,
        private readonly youtubePlaylistProvider: PlaylistProvider,
    ) { }

    async transfer(request: TransferRequest): Promise<Result<TransferResponse>> {
        const startTime = Date.now();

        // 1. Fetch source tracks from Spotify
        console.log(`[SpotifyToYoutubeTransfer] Fetching source tracks from Spotify...`);
        const tracksResult = await this.spotifyTrackProvider.getPlaylistTracks(request.playlistId);
        if (!tracksResult.ok) {
            return { ok: false, error: tracksResult.error };
        }

        const tracks = tracksResult.data;

        // 2. Match tracks to YouTube
        console.log(`[SpotifyToYoutubeTransfer] Matching tracks to YouTube...`);
        const { matchedTracks, unmatchedTracks } = await this.matchTracks(tracks);

        // 3. Create target playlist on YouTube
        console.log(`[SpotifyToYoutubeTransfer] Creating target playlist on YouTube...`);

        const playlistCreationResult: Result<PlaylistCreationResult> = await this.youtubePlaylistProvider.createPlaylist(request.playlistName, request.playlistDescription);
        if (!playlistCreationResult.ok) {
            return { ok: false, error: playlistCreationResult.error };
        }

        const createdPlaylistId = playlistCreationResult.data.id;
        const createdPlaylistUrl = playlistCreationResult.data.url;

        // 4. Add matched tracks to target playlist
        console.log(`[SpotifyToYoutubeTransfer] Adding matched tracks to target playlist...`);
        const trackIds: string[] = matchedTracks.map((track) => track.id);
        // TODO: Implement this

        const cacheStats = getYoutubeCacheStats();

        console.log(`[SpotifyToYoutubeTransfer] Transfer completed successfully in ${Date.now() - startTime}ms`);

        return {
            ok: true,
            data: {
                success: true,
                playlistId: "1234567890",
                playlistUrl: "https://www.youtube.com/playlist?list=1234567890",
                tracksTotal: tracks.length,
                tracksMatched: matchedTracks.length,
                tracksAdded: 0, // TODO: Implement this
                matchedTracks: matchedTracks,
                unmatchedTracks: unmatchedTracks,
                failedToAdd: [],
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
}