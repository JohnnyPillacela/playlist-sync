// lib/cache/constants.ts

export const CACHE_KEY_SEPARATOR = ':';

// GENERIC TTLs
export const PLAYLISTS_TTL_SECONDS = 60 * 60 * 24; // 24 hours
export const NORMALIZED_PLAYLISTS_TTL_SECONDS = 60 * 60 * 24; // 24 hours
export const YOUTUBE_SEARCH_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const IN_MEMORY_CACHE_HIT = '[In-memory LRU cache] hit';
const IN_MEMORY_CACHE_MISS = '[In-memory LRU cache] miss';
const REDIS_CACHE_HIT = '[Redis cache] hit';
const REDIS_CACHE_MISS = '[Redis cache] miss';
const FETCHING_FROM_API = '[Fetching from API...]';

// GENERIC NAMESPACES BUILD UP
const YT_NAMESPACE = 'yt';
const SP_NAMESPACE = 'sp';
const PLAYLIST_NAMESPACE = 'playlists';
const SEARCH_NAMESPACE = 'search';
const NORMALIZED_PLAYLISTS_NAMESPACE = 'normalized-playlists';
const NORMALIZED_PLAYLIST_TRACKS_NAMESPACE = 'normalized-playlist-tracks';
const PLAYLIST_TRACKS_NAMESPACE = 'playlist-tracks';

// YOUTUBE
export const YOUTUBE = {
    NAMESPACE: YT_NAMESPACE,
    PLAYLIST_NAMESPACE: `${YT_NAMESPACE}:${PLAYLIST_NAMESPACE}`,
    NORMALIZED_PLAYLISTS_NAMESPACE: `${YT_NAMESPACE}:${NORMALIZED_PLAYLISTS_NAMESPACE}`,
    NORMALIZED_PLAYLIST_TRACKS_NAMESPACE: `${YT_NAMESPACE}:${NORMALIZED_PLAYLIST_TRACKS_NAMESPACE}`,
    SEARCH_NAMESPACE: `${YT_NAMESPACE}:${SEARCH_NAMESPACE}`,
} as const;

export const SPOTIFY = {
    NAMESPACE: SP_NAMESPACE,
    PLAYLIST_NAMESPACE: `${SP_NAMESPACE}:${PLAYLIST_NAMESPACE}`,
    NORMALIZED_PLAYLISTS_NAMESPACE: `${SP_NAMESPACE}:${NORMALIZED_PLAYLISTS_NAMESPACE}`,
    PLAYLIST_TRACKS_NAMESPACE: `${SP_NAMESPACE}:${PLAYLIST_TRACKS_NAMESPACE}`,
    NORMALIZED_PLAYLIST_TRACKS_NAMESPACE: `${SP_NAMESPACE}:${NORMALIZED_PLAYLIST_TRACKS_NAMESPACE}`,
}

// CACHE MESSAGES
export const CACHE_MESSAGES = {
    IN_MEMORY_CACHE_HIT,
    IN_MEMORY_CACHE_MISS,
    REDIS_CACHE_HIT,
    REDIS_CACHE_MISS,
    FETCHING_FROM_API,
} as const;

// PROVIDER CALLER NAMESPACES
export const PROVIDER_CALLERS = {
    SPOTIFY_PLAYLISTS: '[Spotify Playlist Provider - getUserPlaylists()]',
    YOUTUBE_PLAYLISTS: '[YouTube Playlist Provider - getUserPlaylists()]',
    SPOTIFY_PLAYLISTS_RAW: '[Spotify Playlist Provider - getRawPlaylistsFromAPI()]',
    YOUTUBE_PLAYLISTS_RAW: '[YouTube Playlist Provider - getRawPlaylistsFromAPI()]',
    SPOTIFY_PLAYLIST_TRACKS: '[Spotify Track Provider - getPlaylistTracks()]',
    YOUTUBE_PLAYLIST_TRACKS: '[YouTube Track Provider - getPlaylistTracks()]',
    YOUTUBE_SEARCH: '[YouTube Search Provider - search()]',
    SPOTIFY_SEARCH: '[Spotify Search Provider - search()]',
    YOUTUBE_PLAYLIST_CREATE: '[YouTube Playlist Provider - createPlaylist()]',
    YOUTUBE_PLAYLIST_ADD_TRACKS: '[YouTube Playlist Provider - addTracksToPlaylist()]',
    SPOTIFY_PLAYLIST_CREATE: '[Spotify Playlist Provider - createPlaylist()]',
    SPOTIFY_PLAYLIST_ADD_TRACKS: '[Spotify Playlist Provider - addTracksToPlaylist()]',
} as const;