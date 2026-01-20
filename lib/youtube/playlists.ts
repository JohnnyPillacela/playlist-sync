// /lib/youtube/playlists.ts

import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { NormalizedPlaylist, Result } from "../types";
import { getYoutubeSDK } from "./sdk";
import { isMusicPlaylist } from "./musicFilter";
import { handleYouTubeAPIError } from "./errorHandler";
import { youtubeCache } from "./cache";
import { cookies } from "next/headers";
import { GOOGLE_ACCESS_TOKEN_KEY } from "../constants/google";
import { PLAYLISTS_TTL_SECONDS, YOUTUBE, NORMALIZED_PLAYLISTS_TTL_SECONDS, CACHE_MESSAGES } from "../cache/constants";
import { redis } from "../cache/redis";
import { LRUCache } from "../cache/cache";

const YOUTUBE_PLAYLISTS_NAME = '[YouTube Playlists]';
const YOUTUBE_NORMALIZED_PLAYLISTS_NAME = '[YouTube Normalized Playlists]';

// Get a user-specific cache key suffix based on their access token
async function getUserCacheKey(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get(GOOGLE_ACCESS_TOKEN_KEY)?.value;
    // Use last 8 chars of token as identifier (unique per user, no extra API call needed)
    return token ? token.slice(-8) : 'anonymous';
}

// Simple concurrency limiter (no dependency)
async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let i = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (true) {
            const idx = i++;
            if (idx >= items.length) break;
            results[idx] = await fn(items[idx], idx);
        }
    });

    await Promise.all(workers);
    return results;
}

export async function getYoutubeUserPlaylists(): Promise<Result<youtube_v3.Schema$Playlist[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `${YOUTUBE.PLAYLIST_NAMESPACE}:${userKey}`;

    // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
    const cachedPlaylists = await getFromCaches<youtube_v3.Schema$Playlist[]>(
        cacheKey,
        YOUTUBE_PLAYLISTS_NAME,
        youtubeCache.playlists
    );
    if (cachedPlaylists) {
        return {
            ok: true,
            data: cachedPlaylists,
        }
    }

    console.log(`${YOUTUBE_PLAYLISTS_NAME} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

    // 3. Fetch from API
    const youtubeSDKResult: Result<youtube_v3.Youtube> = await getYoutubeSDK();
    if (!youtubeSDKResult.ok) {
        return {
            ok: false,
            error: youtubeSDKResult.error,
        }
    }

    const youtubeSdk: youtube_v3.Youtube = youtubeSDKResult.data;
    const youtubePlaylists: youtube_v3.Schema$Playlist[] = [];
    let pageToken: string | undefined = undefined;

    // Loop through all pages of playlists
    while (true) {
        let response: youtube_v3.Schema$PlaylistListResponse;
        try {
            response = (await youtubeSdk.playlists.list({
                part: ['snippet', 'contentDetails'],
                mine: true,
                maxResults: 50,
                pageToken: pageToken,
            })).data;
        } catch (error: any) {
            return handleYouTubeAPIError(error);
        }

        // Add items from this page to the youtubePlaylists array
        if (response.items) {
            youtubePlaylists.push(...response.items);
        }

        // Check if there are more pages
        if (!response.nextPageToken) {
            break;
        }

        pageToken = response.nextPageToken;
    }

    // Store in Redis and in-memory LRU cache before returning
    await redis.set(cacheKey, youtubePlaylists, {
        ex: PLAYLISTS_TTL_SECONDS,
    });

    youtubeCache.playlists.set(cacheKey, youtubePlaylists);

    console.log(`${YOUTUBE_PLAYLISTS_NAME} Cached ${youtubePlaylists.length} playlists`);

    return {
        ok: true,
        data: youtubePlaylists,
    }
}

export async function normalizedYoutubePlaylist(): Promise<Result<NormalizedPlaylist[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `${YOUTUBE.NORMALIZED_PLAYLISTS_NAMESPACE}:${userKey}`;

    // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
    const cachedNormalizedPlaylists = await getFromCaches<NormalizedPlaylist[]>(
        cacheKey,
        YOUTUBE_NORMALIZED_PLAYLISTS_NAME,
        youtubeCache.normalizedPlaylists
    );
    if (cachedNormalizedPlaylists) {
        return {
            ok: true,
            data: cachedNormalizedPlaylists,
        }
    }

    console.log(`${YOUTUBE_NORMALIZED_PLAYLISTS_NAME} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

    // 3. Fetch from API
    const youtubePlaylistsResult = await getYoutubeUserPlaylists();

    if (!youtubePlaylistsResult.ok) {
        return {
            ok: false,
            error: youtubePlaylistsResult.error,
        }
    }

    const youtubePlaylists = youtubePlaylistsResult.data
        .filter((playlist) => playlist.id != null); // Filter out playlists without IDs

    const checks: Array<{ playlist: any; isMusic: boolean }> = [];

    for (const playlist of youtubePlaylists) {
        const id = playlist.id!;
        const res = await isMusicPlaylist(id, {
            maxItemsToInspect: 5,
            minMusicRatio: 0.7,
            minInspected: 3,
        });

        if (!res.ok) {
            // Don't hide errors as "not music" — bubble them up
            return { ok: false, error: res.error };
        }

        checks.push({ playlist, isMusic: res.data });
    }

    const normalizedPlaylists: NormalizedPlaylist[] = checks
        .filter((playlist) => playlist.isMusic)
        .map(({ playlist }) => ({
            id: playlist.id!,
            name: playlist.snippet?.title || "Untitled Playlist",
            trackCount: playlist.contentDetails?.itemCount || 0,
            thumbnailUrl: playlist.snippet?.thumbnails?.default?.url || "Undefined",
            provider: "youtube-music",
        }));

    // Store in Redis and in-memory LRU cache before returning
    await redis.set(cacheKey, normalizedPlaylists, {
        ex: NORMALIZED_PLAYLISTS_TTL_SECONDS,
    });

    youtubeCache.normalizedPlaylists.set(cacheKey, normalizedPlaylists);

    console.log(`${YOUTUBE_NORMALIZED_PLAYLISTS_NAME} Cached ${normalizedPlaylists.length} normalized playlists`);

    return {
        ok: true,
        data: normalizedPlaylists,
    }
}


/**
 * Get data from caches. Should swallow errors and return null if not found.
 * Best-effort warm LRU cache if found in Redis.
 * @param cacheKey - The key to get the data from.
 * @param callerNamespace - The namespace of the caller.
 * @param lruCache - The LRU cache to get the data from.
 * @returns The data from the caches.
 */
async function getFromCaches<T>(
    cacheKey: string,
    callerNamespace: string,
    lruCache: LRUCache<T>
): Promise<T | null> {

    // 1. LRU (L1)
    try {
        const memoryHit = lruCache.get(cacheKey);
        if (memoryHit) {
            console.log(`${callerNamespace} ${CACHE_MESSAGES.IN_MEMORY_CACHE_HIT}`);
            return memoryHit;
        }
        console.log(`${callerNamespace} ${CACHE_MESSAGES.IN_MEMORY_CACHE_MISS}`);
    } catch (err) {
        console.warn(`${callerNamespace} LRU get failed - MANUAL CHECK`, err);
    }

    // 2. Redis (L2)
    try {
        const redisHit = await redis.get<T>(cacheKey);
        if (redisHit) {
            console.log(`${callerNamespace} ${CACHE_MESSAGES.REDIS_CACHE_HIT}`);

            // 🔥 Important: warm LRU, best-effort
            try {
                lruCache.set(cacheKey, redisHit);
            } catch (err) {
                console.warn(`${callerNamespace} LRU warm failed`, err);
            }

            return redisHit;
        }

        console.log(`${callerNamespace} ${CACHE_MESSAGES.REDIS_CACHE_MISS}`);
    } catch (err) {
        console.warn(`${callerNamespace} Redis get failed - MANUAL CHECK`, err);
    }

    return null;
}


/**
 * Set data in caches.
 * @param cacheKey - The key to set the data to.
 * @param callerNamespace - The namespace of the caller.
 * @param lruCache - The LRU cache to set the data to.
 * @param data - The data to set.
 * @param ttlSeconds - The TTL in seconds.
 * @returns The data from the caches.
 */
async function setCaches<T extends {}>(
    cacheKey: string,
    callerNamespace: string,
    lruCache: LRUCache<T>,
    data: T,
    ttlSeconds: number
): Promise<void> {

    // L1: In-memory LRU (fast, best-effort)
    try {
        lruCache.set(cacheKey, data);
    } catch (err) {
        console.warn(`${callerNamespace} LRU set failed`, err);
    }

    // L2: Redis (durable, best-effort)
    try {
        await redis.set(cacheKey, data, { ex: ttlSeconds });
    } catch (err) {
        console.warn(`${callerNamespace} Redis set failed`, err);
    }
}

