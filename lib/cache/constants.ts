// lib/cache/constants.ts

export const CACHE_KEY_SEPARATOR = ':';

// GENERIC
export const PLAYLIST_NAMESPACE = 'playlists';
export const SEARCH_NAMESPACE = 'search';
export const PLAYLISTS_TTL_SECONDS = 60 * 60; // 1 hour
export const NORMALIZED_PLAYLISTS_TTL_SECONDS = 60 * 60; // 1 hour



// YOUTUBE
export const YOUTUBE_NAMESPACE = 'yt';
export const YOUTUBE_PLAYLIST_NAMESPACE = `${YOUTUBE_NAMESPACE}:${PLAYLIST_NAMESPACE}`;

// SPOTIFY
export const SPOTIFY_NAMESPACE = 'sp';