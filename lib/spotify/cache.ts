// lib/spotify/cache.ts

import { LRUCache } from '../cache/cache';
import { hash } from '../cache/keyBuilder';
import { NormalizedPlaylist } from '../types';
import { _getCurrentUserDetails } from './auth';

// Cache for general Spotify search results (tracks, artists, albums, etc)
const spotifySearchCache = new LRUCache<any>(500, 30);

// Cache for Spotify playlist metadata (playlists, their attributes)
const spotifyPlaylistCache = new LRUCache<any>(500, 30);

// Cache for specific Spotify track data
const spotifyTrackCache = new LRUCache<any>(500, 30);

// Cache for Normalized Spotify playlists
const spotifyNormalizedPlaylistCache = new LRUCache<NormalizedPlaylist[]>(1000, 60 * 24) // 24 hours

/**
 * Singleton LRU cache instance for Spotify use cases.
 * Configuration: 500 entries max, 30 minute TTL (minutes).
 * 
 * spotifySearchCache:       For general Spotify search results.
 * spotifyPlaylistCache:     For caching Spotify playlist metadata.
 * spotifyTrackCache:        For caching specific Spotify track data.
 */
export const spotifyCache = {
    search: spotifySearchCache,
    playlists: spotifyPlaylistCache,
    tracks: spotifyTrackCache,
    normalizedPlaylists: spotifyNormalizedPlaylistCache,
} as const;

// Get a user-specific cache key suffix based on their access token
export const getUserCacheKey = async (): Promise<string> => {
    const currentUserDetailsResult = await _getCurrentUserDetails();
    if (!currentUserDetailsResult.ok) {
        return '';
    }
    const currentUserDetails = currentUserDetailsResult.data;
    return hash(currentUserDetails.id);
}