import { createHash } from 'crypto';

const MAX_KEY_LENGTH = 512;
const KEY_SEPARATOR = ':';

function normalize(str: string | null | undefined): string {
    if (!str) return '';

    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // strip punctuation
        .replace(/\s+/g, ' ')
        .trim();
}

function hash(str: string): string {
    return createHash('sha256').update(str).digest('hex');
}

/**
 * Builds a safe, deterministic cache key for knowledge-based lookups
 * (tracks, artists, albums, etc).
 *
 * - Never throws
 * - Never returns empty keys
 * - Hashes when needed
 * - Safe for Redis + DB migration
 */
export function buildKnowledgeCacheKey(
    namespace: string,
    parts: Array<string | null | undefined>
): string {
    const safeNamespace = normalize(namespace) || 'unknown';

    const normalizedParts = parts
        .map(normalize)
        .filter(Boolean);

    // Fallback: avoid empty key
    if (normalizedParts.length === 0) {
        return `${safeNamespace}${KEY_SEPARATOR}unknown`;
    }

    const rawKey = [safeNamespace, ...normalizedParts].join(KEY_SEPARATOR);

    if (rawKey.length > MAX_KEY_LENGTH) {
        return `${safeNamespace}${KEY_SEPARATOR}hash${KEY_SEPARATOR}${hash(rawKey)}`;
    }

    return rawKey;
}
