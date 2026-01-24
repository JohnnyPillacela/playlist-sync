// /lib/types.ts

/**
 * A generic result type that can be either successful or failed.
 * @template T - The type of the successful result.
 * @template E - The type of the error.
 * @returns {Result<T, E>} A result object.
 */
export type Result<T, E = string> =
    | { ok: true; data: T }
    | { ok: false; error: E }

/**
 * A list of authentication errors.
 * @returns {AUTH_ERRORS} A list of authentication errors.
 */
export const AUTH_ERRORS = {
    SPOTIFY_NO_TOKEN_FOUND: 'spotify_no_access_token_found',
    SPOTIFY_ACCESS_TOKEN_EXPIRED: 'spotify_access_token_expired',
    GOOGLE_NO_TOKEN_FOUND: 'google_no_access_token_found',
    GOOGLE_ACCESS_TOKEN_EXPIRED: 'google_access_token_expired',
} as const;

export const SDK_ERRORS = {
    YOUTUBE_SDK_NOT_INITIALIZED: 'youtube_sdk_not_initialized',
    SPOTIFY_SDK_NOT_INITIALIZED: 'spotify_sdk_not_initialized',
    SPOTIFY_PLAYLIST_CREATE_FAILED: 'spotify_playlist_create_failed',
    SPOTIFY_PLAYLIST_ADD_TRACKS_FAILED: 'spotify_playlist_add_tracks_failed',
    YOUTUBE_PLAYLIST_CREATION_FAILED: 'youtube_playlist_creation_failed',
    YOUTUBE_PLAYLIST_ADD_TRACKS_FAILED: 'youtube_playlist_add_tracks_failed',
    YOUTUBE_API_ERROR: 'youtube_api_error',
    SPOTIFY_API_ERROR: 'spotify_api_error',
    YOUTUBE_QUOTA_EXCEEDED: 'youtube_quota_exceeded',
    SPOTIFY_QUOTA_EXCEEDED: 'spotify_quota_exceeded',
    YOUTUBE_RATE_LIMIT: 'youtube_rate_limit',
    SPOTIFY_RATE_LIMIT: 'spotify_rate_limit',
} as const;

export const GEN_ERRORS = {
    NOT_FOUND: 'not_found',
    LOW_CONFIDENCE: 'low_confidence',
    API_ERROR: 'api_error',
    NO_RESULTS: 'no_results',
} as const;

export type NormalizedPlaylist = {
    id: string;
    name: string;
    trackCount: number;
    thumbnailUrl: string;
    provider: 'spotify' | 'youtube-music';
};

export type NormalizedTrack = {
    id: string;
    name: string;
    artists: string[];
    thumbnailUrl: string;
    album: string;
    duration: number;
    provider: 'spotify' | 'youtube-music';
}

export type PlaylistProviderData = {
    service: 'spotify' | 'youtube-music';
    isAuthenticated: boolean;
    playlists?: NormalizedPlaylist[] | null;
};