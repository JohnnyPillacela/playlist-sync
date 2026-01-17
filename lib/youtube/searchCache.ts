// lib/youtube/searchCache.ts

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  usagePercent: number;
  hitRate: number;
  hits: number;
  misses: number;
}

/**
 * Production-ready LRU (Least Recently Used) cache with TTL support.
 * Automatically evicts oldest entries when full and expires stale data.
 */
export class YouTubeSearchCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttlMs: number;
  private hits: number;
  private misses: number;

  /**
   * @param maxSize Maximum number of entries (default: 1000)
   * @param ttlMinutes Time to live in minutes (default: 60)
   */
  constructor(maxSize: number = 1000, ttlMinutes: number = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.hits = 0;
    this.misses = 0;
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

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Move to end (most recently used) by deleting and re-adding
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  /**
   * Store a value in the cache with current timestamp.
   * Evicts oldest entry if cache is full.
   */
  set(key: string, value: T): void {
    // If key exists, delete it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if a key exists and is not expired (without updating LRU order)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
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

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
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

// Singleton instance for YouTube search results
// Default: 1000 entries, 60 minute TTL
export const youtubeSearchCache = new YouTubeSearchCache(1000, 60);
