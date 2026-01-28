// lib/spotify/cache.ts

import { LRUCache } from '../cache/cache';
import { hash } from '../cache/keyBuilder';
import { NormalizedPlaylist, NormalizedTrack } from '../types';
import { _getCurrentUserDetails } from './auth';

// Cache for general Spotify search results (tracks, artists, albums, etc)
const spotifySearchCache = new LRUCache<any>(500, 30);

// Cache for Spotify playlist metadata (playlists, their attributes)
const spotifyPlaylistCache = new LRUCache<any>(500, 30);

// Cache for specific Spotify track data
const spotifyNormalizedTrackCache = new LRUCache<NormalizedTrack[]>(500, 60 * 24); // 24 hours

// Cache for Normalized Spotify playlists
const spotifyNormalizedPlaylistCache = new LRUCache<NormalizedPlaylist[]>(1000, 60 * 24) // 24 hours

// Cache for Spotify playlist mapping
const spotifyPlaylistMapCache = new LRUCache<any>(500, 30 * 24 * 30); // 30 days

/**
 * Singleton LRU cache instance for Spotify use cases.
 * Configuration: 500 entries max, 30 minute TTL (minutes).
 * 
 * spotifySearchCache:       For general Spotify search results.
 * spotifyPlaylistCache:     For caching Spotify playlist metadata.
 * spotifyNormalizedTrackCache:        For caching specific Spotify track data.
 */
export const spotifyCache = {
    search: spotifySearchCache,
    playlists: spotifyPlaylistCache,
    normalizedTracks: spotifyNormalizedTrackCache,
    normalizedPlaylists: spotifyNormalizedPlaylistCache,
    playlistMap: spotifyPlaylistMapCache,
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

// Interface for Spotify playlist mapping
export interface SpotifyPlaylistMapping {
    youtubePlaylistId: string;
    youtubePlaylistName: string;
    lastSyncedAt: number; // Unix timestamp
    trackCount: number; // Number of tracks synced
}