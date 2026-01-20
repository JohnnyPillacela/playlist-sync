// lib/youtube/cache.ts

import { youtube_v3 } from 'googleapis';
import { LRUCache } from '../cache/cache';
import { YouTubeSearchResult } from './search';

/**
 * Cache for YouTube search results.
 * 
 * Key format: `youtube:search:{searchQuery}`
 * Example: `youtube:search:The Beatles Hey Jude audio`
 * 
 * Use case:
 * - Caches YouTube API search results based on the actual query string sent to the API
 * - Keys are generated using buildCacheKey('youtube:search', [searchQuery])
 * - Query strings are normalized and deduplicated automatically by buildSearchQuery()
 * - This ensures repeated searches for the same query (regardless of user) don't make redundant API calls
 * - This cache is NOT user-specific - all users share the same cached search results
 * - Saves on YouTube API quota and reduces latency for popular searches
 * - Note: The 'cameFromCache' field is always false when stored, and set to true when retrieved
 */
const youtubeSearchCache = new LRUCache<YouTubeSearchResult>(1000, 60 * 24); // 24 hours

/**
 * Cache for YouTube playlists metadata.
 * 
 * Key format: `youtube:playlists:{userToken}`
 * Example: `youtube:playlists:abc12345`
 * 
 * Use case:
 * - Caches the complete playlist library from YouTube Music/YouTube per user
 * - User-specific based on access token to prevent cross-user data leaks
 * - Prevents repeated API calls when listing playlists
 * - Saves on YouTube API quota and improves user experience
 */
const youtubePlaylistCache = new LRUCache<youtube_v3.Schema$Playlist[]>(1000, 60 * 24); // 24 hours

/**
 * Cache for specific YouTube playlist track data, scoped by user and playlist.
 * 
 * Key format: `youtube:tracks:{userId}:{playlistId}`
 * Example: `youtube:tracks:abc123:PLxyz789`
 * 
 * Use case:
 * - Caches the track list (songs) for a specific playlist belonging to a specific user
 * - Keys are generated using buildCacheKey('youtube:tracks', [userId, playlistId])
 * - Double-scoped: Both user-specific AND playlist-specific
 * - Prevents repeated API calls when viewing the same playlist
 * - Saves on YouTube API quota for frequently accessed playlists
 */
const youtubeTrackCache = new LRUCache<youtube_v3.Schema$PlaylistItem[]>(1000, 60 * 24); // 24 hours

/**
 * Cache for normalized YouTube playlists (filtered for music playlists only).
 * 
 * Key format: `youtube:normalized-playlists:{userToken}`
 * Example: `youtube:normalized-playlists:abc12345`
 * 
 * Use case:
 * - Caches the normalized, music-filtered playlist data per user
 * - User-specific based on access token to prevent cross-user data leaks
 * - This is expensive to compute (requires checking each playlist for music content)
 * - Prevents repeated music filtering operations
 * - Saves significant API quota and processing time
 */
const youtubeNormalizedPlaylistCache = new LRUCache<any[]>(1000, 60 * 24); // 24 hours

/**
 * Singleton LRU cache instance for YouTube search results.
 * Configuration: 1000 entries max, 24 hour TTL
 */
export const youtubeCache = {
    search: youtubeSearchCache,
    playlists: youtubePlaylistCache,
    tracks: youtubeTrackCache,
    normalizedPlaylists: youtubeNormalizedPlaylistCache,
} as const;

/**
 * Get comprehensive cache statistics for monitoring
 */
export function getYoutubeCacheStats() {
    return {
        search: youtubeSearchCache.getStats(),
        playlists: youtubePlaylistCache.getStats(),
        tracks: youtubeTrackCache.getStats(),
        normalizedPlaylists: youtubeNormalizedPlaylistCache.getStats(),
    };
}
