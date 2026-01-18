// lib/cache/cache.ts

import { LRUCache as LRU } from 'lru-cache';

export interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

export interface CacheStats {
    size: number;
    maxSize: number;
    usagePercent: number;
    hitRate: number;
    hits: number;
    misses: number;
}

export interface CacheOptions {
    maxSize?: number;
    ttlMinutes?: number;
}

/**
 * Production-ready LRU (Least Recently Used) cache with TTL support.
 * Automatically evicts oldest entries when full and expires stale data.
 * Generic wrapper around the lru-cache package.
 */
export class LRUCache<T = any> {
    private cache: LRU<string, CacheEntry<T>>;
    private maxSize: number;
    private ttlMs: number;
    private hits: number;
    private misses: number;

    /**
     * @param maxSize Maximum number of entries (default: 1000)
     * @param ttlMinutes Time to live in minutes (default: 60)
     */
    constructor(maxSize: number = 1000, ttlMinutes: number = 60) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMinutes * 60 * 1000;
        this.hits = 0;
        this.misses = 0;

        this.cache = new LRU<string, CacheEntry<T>>({
            max: maxSize,
            ttl: this.ttlMs,
            updateAgeOnGet: true, // Updates LRU order on access
            updateAgeOnHas: false, // has() doesn't affect LRU order
        });
    }

    /**
     * Retrieve a cached value. Returns null if not found or expired.
     * Updates access time for LRU ordering.
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        // Check if entry has expired (lru-cache handles TTL automatically, but we track timestamp too)
        const now = Date.now();
        if (now - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return entry.value;
    }

    /**
     * Store a value in the cache with current timestamp.
     * Evicts oldest entry if cache is full (handled automatically by lru-cache).
     */
    set(key: string, value: T): void {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
        });
    }

    /**
     * Check if a key exists and is not expired (without updating LRU order)
     */
    has(key: string): boolean {
        const entry = this.cache.peek(key); // peek doesn't update LRU order
        if (!entry) return false;

        const now = Date.now();
        if (now - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Clear all cached entries and reset statistics
     */
    clear(): void {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache performance statistics
     */
    getStats(): CacheStats {
        const totalRequests = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            usagePercent: (this.cache.size / this.maxSize) * 100,
            hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
            hits: this.hits,
            misses: this.misses,
        };
    }

    /**
     * Remove expired entries (useful for periodic cleanup)
     */
    cleanup(): number {
        const now = Date.now();
        let removed = 0;

        // Get all keys and check for expiration
        const keys = Array.from(this.cache.keys());
        for (const key of keys) {
            const entry = this.cache.peek(key);
            if (entry && now - entry.timestamp > this.ttlMs) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }

    /**
     * Get current cache size
     */
    get size(): number {
        return this.cache.size;
    }
}
