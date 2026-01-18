// lib/cache/keyBuilder.ts

import { createHash } from 'crypto';

/**
 * Maximum key length before automatic hashing is applied.
 * Keys longer than this will be hashed to prevent memory/performance issues.
 */
const MAX_KEY_LENGTH = 512;

/**
 * Primary separator for cache key components.
 * Using colon as it's standard, readable, and URL-safe.
 */
const KEY_SEPARATOR = ':';

/**
 * Normalizes a string for safe use in cache keys.
 * - Trims leading/trailing whitespace
 * - Replaces internal whitespace sequences with single space
 * - Removes newlines and tabs
 * - Handles null/undefined by converting to empty string
 * 
 * @param str The string to normalize
 * @returns Normalized string safe for use in cache keys
 */
function normalizeString(str: string | null | undefined): string {
    if (str == null) return '';
    
    return str
        .trim()
        .replace(/\s+/g, ' ')  // Collapse multiple spaces into one
        .replace(/[\n\r\t]/g, ' ')  // Replace newlines/tabs with spaces
        .trim();  // Final trim after replacements
}

/**
 * Creates a deterministic hash of a string using SHA-256.
 * Used for very long cache keys to keep them manageable.
 * 
 * @param str The string to hash
 * @returns Hex-encoded hash (64 characters)
 */
function hashString(str: string): string {
    return createHash('sha256')
        .update(str)
        .digest('hex');
}

/**
 * Builds a standardized cache key from a namespace and component parts.
 * 
 * Features:
 * - Namespace prefixing prevents cache collisions between different services
 * - Automatic string normalization (whitespace, special characters)
 * - Deterministic key generation for consistent cache hits
 * - Automatic hashing for very long keys (>512 chars)
 * 
 * @param namespace The cache namespace (e.g., "youtube:search", "spotify:playlists")
 * @param parts Array of key components (will be normalized and joined)
 * @returns A consistent cache key string
 * 
 * @example
 * // Simple key
 * buildCacheKey("youtube:playlists", ["user123"])
 * // Returns: "youtube:playlists:user123"
 * 
 * @example
 * // Complex key with multiple parts
 * buildCacheKey("youtube:search", ["The Beatles", "Hey Jude", "true"])
 * // Returns: "youtube:search:The Beatles:Hey Jude:true"
 * 
 * @example
 * // Very long key gets automatically hashed
 * buildCacheKey("youtube:search", [veryLongString])
 * // Returns: "youtube:search:hash:a1b2c3d4..." (hashed version)
 */
export function buildCacheKey(namespace: string, parts: (string | number | boolean)[]): string {
    // Validate namespace
    if (!namespace || typeof namespace !== 'string') {
        throw new Error('Cache key namespace must be a non-empty string');
    }
    
    // Normalize all parts to strings and clean them
    const normalizedParts = parts.map(part => {
        // Convert to string if not already
        const str = String(part);
        return normalizeString(str);
    }).filter(part => part.length > 0); // Remove empty parts
    
    // Build the initial key
    const rawKey = [namespace, ...normalizedParts].join(KEY_SEPARATOR);
    
    // If key is too long, hash it for efficiency
    if (rawKey.length > MAX_KEY_LENGTH) {
        const hash = hashString(rawKey);
        // Keep the namespace visible for debugging, add hash indicator
        return `${namespace}${KEY_SEPARATOR}hash${KEY_SEPARATOR}${hash}`;
    }
    
    return rawKey;
}

/**
 * Validates that required cache key parts are present and non-empty.
 * Throws an error if validation fails.
 * 
 * @param parts Object mapping part names to their values
 * @throws Error if any required part is missing or empty
 * 
 * @example
 * validateKeyParts({ userId: "123", playlistId: "abc" });
 * // Passes validation
 * 
 * @example
 * validateKeyParts({ userId: "", playlistId: "abc" });
 * // Throws: "Cache key part 'userId' is required but was empty"
 */
export function validateKeyParts(parts: Record<string, string | undefined | null>): void {
    for (const [name, value] of Object.entries(parts)) {
        if (!value || normalizeString(value).length === 0) {
            throw new Error(`Cache key part '${name}' is required but was empty`);
        }
    }
}

/**
 * Joins an array of strings with a delimiter, handling empty values.
 * Useful for cache keys that include array data (e.g., multiple artists).
 * 
 * @param items Array of strings to join
 * @param delimiter Delimiter to use (default: "|")
 * @returns Joined string with empty values filtered out
 * 
 * @example
 * joinKeyParts(["The Beatles", "John Lennon"])
 * // Returns: "The Beatles|John Lennon"
 * 
 * @example
 * joinKeyParts(["artist1", "", "artist2"])
 * // Returns: "artist1|artist2" (empty values removed)
 */
export function joinKeyParts(items: (string | null | undefined)[], delimiter: string = '|'): string {
    return items
        .map(item => normalizeString(item))
        .filter(item => item.length > 0)
        .join(delimiter);
}

