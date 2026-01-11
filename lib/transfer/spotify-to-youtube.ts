// lib/transfer/spotify-to-youtube

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

