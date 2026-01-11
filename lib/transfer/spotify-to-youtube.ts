// lib/transfer/spotify-to-youtube

import { _fetchPlaylistTracksSDK } from "../spotify/playlists";
import { Track } from "@spotify/web-api-ts-sdk";


interface TransferRequest {
    spotifyPlaylistId: string;
    playlistName: string;
}

interface TransferResult {
    sucesss: boolean;
    youtubePlaylistId?: string;
    youtubePlaylistUrl?: string;
    tracksTotal: number;
    tracksMatched: number;
    tracksAdded: number;
    unmatchedTracks: Array<{
        name: string;
        artists: string[];
        reason: 'not_found' | 'low_confidence' | 'api_error';
    }>;
    failedToAdd: Array<{
        videoId: string;
        trackName: string;
        error: string;
    }>
    duration: number // milliseconds
}

async function transfer({spotifyPlaylistId, playlistName}: TransferRequest){
    const playlistTrackResult = await _fetchPlaylistTracksSDK(spotifyPlaylistId);

    if (!playlistTrackResult.ok) {
        return {
            ok: false,
            error: "Error fetching spotify playlists"
        }
    }

    playlistTrackResult.data.forEach((track: Track) => {
        const trackName: string = track.name;
        const trackAlbumName: string = track.album.name;
        const trackArtists: string[] = track.artists.map((artist) => artist.name);
    })
}