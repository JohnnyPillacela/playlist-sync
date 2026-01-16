// lib/transfer/spotify-to-youtube

import { _fetchPlaylistTracksSDK } from "../spotify/playlists";
import { Track } from "@spotify/web-api-ts-sdk";
import { searchYouTubeForTrack, YouTubeSearchResult } from "../youtube/search";
import { GEN_ERRORS, Result, SDK_ERRORS } from "../types";

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
    matchedTracks: Array<YouTubeSearchResult>;
    unmatchedTracks: Array<UnmatchedTrack>;
    failedToAdd: Array<{
        videoId: string;
        trackName: string;
        error: string;
    }>
    duration: number // milliseconds
}

export async function transfer({ spotifyPlaylistId, playlistName }: TransferRequest): Promise<Result<TransferResult>> {
    const startTime = Date.now();
    const playlistTrackResult = await _fetchPlaylistTracksSDK(spotifyPlaylistId);

    if (!playlistTrackResult.ok) {
        return {
            ok: false,
            error: SDK_ERRORS.SPOTIFY_API_ERROR
        }
    }

    const matchedTracks: Array<YouTubeSearchResult> = [];
    const unmatchedTracks: Array<UnmatchedTrack> = [];

    const playlistTracks: Track[] = playlistTrackResult.data;

    for (const track of playlistTracks) {
        const searchYoutubeForTrackResults = await searchYouTubeForTrack({
            trackName: track.name,
            trackArtists: track.artists.map((artist) => artist.name),
            trackAlbumName: track.album.name,
            prioritizeAudio: true,
        });

        if (!searchYoutubeForTrackResults.ok) {
            unmatchedTracks.push({
                name: track.name,
                artists: track.artists.map((artist) => artist.name),
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
                artists: track.artists.map((artist) => artist.name),
                reason: GEN_ERRORS.LOW_CONFIDENCE
            });
        }

    }

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
            duration: Date.now() - startTime
        }
    };
};