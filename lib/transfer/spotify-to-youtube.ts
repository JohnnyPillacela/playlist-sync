// lib/transfer/spotify-to-youtube

import { searchYouTubeForTrack } from "../youtube/search";
import { GEN_ERRORS, NormalizedTrack, Result, SDK_ERRORS } from "../types";
import { getYoutubeCacheStats } from "../youtube/cache";
import { CacheStats } from "../cache/cache";
import { SpotifyTrackProviderImpl } from "../providers/spotify/SpotifyTrackProviderImpl";
import { SearchResult } from "../providers/SearchProvider";

interface TransferRequest {
    spotifyPlaylistId: string;
    playlistName: string;
}

interface UnmatchedTrack {
    name: string;
    artists: string[];
    reason: 
     typeof SDK_ERRORS.YOUTUBE_API_ERROR |
     typeof SDK_ERRORS.SPOTIFY_API_ERROR | 
     typeof GEN_ERRORS.NOT_FOUND |
     typeof GEN_ERRORS.LOW_CONFIDENCE |
     typeof GEN_ERRORS.API_ERROR;
}

interface TransferResult {
    success: boolean;
    youtubePlaylistId?: string;
    youtubePlaylistUrl?: string;
    tracksTotal: number;
    tracksMatched: number;
    tracksAdded: number;
    matchedTracks: Array<SearchResult>;
    unmatchedTracks: Array<UnmatchedTrack>;
    failedToAdd: Array<{
        videoId: string;
        trackName: string;
        error: string;
    }>
    duration: number // milliseconds
    cacheStats?: CacheStats; // Search cache performance statistics
}

export async function transfer({ spotifyPlaylistId, playlistName }: TransferRequest): Promise<Result<TransferResult>> {
    const startTime = Date.now();
    const spotifyTrackProvider = new SpotifyTrackProviderImpl();
    const playlistTrackResult = await spotifyTrackProvider.getPlaylistTracks(spotifyPlaylistId);

    if (!playlistTrackResult.ok) {
        return {
            ok: false,
            error: playlistTrackResult.error
        }
    }

    const matchedTracks: Array<SearchResult> = [];
    const unmatchedTracks: Array<UnmatchedTrack> = [];

    const playlistTracks: NormalizedTrack[] = playlistTrackResult.data;

    for (const track of playlistTracks) {
        const searchYoutubeForTrackResults = await searchYouTubeForTrack({
            trackName: track.name,
            trackArtists: track.artists,
            trackAlbumName: track.album,
            prioritizeAudio: true,
        });

        if (!searchYoutubeForTrackResults.ok) {
            unmatchedTracks.push({
                name: track.name,
                artists: track.artists,
                reason: SDK_ERRORS.YOUTUBE_API_ERROR
            });
            continue; // Skip to next track
        }

        const youtubeSearchResult = searchYoutubeForTrackResults.data;

        if (youtubeSearchResult.confidence >= 0.7) {
            matchedTracks.push(youtubeSearchResult);
        } else {
            unmatchedTracks.push({
                name: track.name,
                artists: track.artists,
                reason: GEN_ERRORS.LOW_CONFIDENCE
            });
        }

    }

    const cacheStats = getYoutubeCacheStats();

    return {
        ok: true,
        data: {
            success: true,
            tracksTotal: playlistTracks.length,
            tracksMatched: matchedTracks.length,
            tracksAdded: 0, // TODO: Implement tracks added
            matchedTracks: matchedTracks,
            unmatchedTracks: unmatchedTracks,
            failedToAdd: [],
            duration: Date.now() - startTime,
            cacheStats: cacheStats.search, // Include search cache stats
        }
    };
};