// lib/cache/layers.ts

import { redis } from "./redis";
import { LRUCache } from "./cache";
import { CACHE_MESSAGES } from "./constants";

/**
 * Get data from caches. Should swallow errors and return null if not found.
 * Best-effort warm LRU cache if found in Redis.
 * @param cacheKey - The key to get the data from.
 * @param callerNamespace - The namespace of the caller.
 * @param lruCache - The LRU cache to get the data from.
 * @returns The data from the caches.
 */
export const getFromCaches = async <T extends {}>(
    cacheKey: string,
    callerNamespace: string,
    lruCache: LRUCache<T>
): Promise<T | null> => {

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
 * @returns void.
 */
export const setCaches = async <T extends {}>(
    cacheKey: string,
    callerNamespace: string,
    lruCache: LRUCache<T>,
    data: T,
    ttlSeconds: number
): Promise<void> => {

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

