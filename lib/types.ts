// /lib/types.ts

/**
 * A generic result type that can be either successful or failed.
 * @template T - The type of the successful result.
 * @template E - The type of the error.
 * @returns {Result<T, E>} A result object.
 */
export type Result<T, E = string> =
    | { ok: true; data: T }
    | { ok: false; error: E }

/**
 * A list of authentication errors.
 * @returns {AUTH_ERRORS} A list of authentication errors.
 */
export const AUTH_ERRORS = {
    SPOTIFY_NO_TOKEN_FOUND: 'spotify_no_access_token_found',
    SPOTIFY_ACCESS_TOKEN_EXPIRED: 'spotify_access_token_expired',
    GOOGLE_NO_TOKEN_FOUND: 'google_no_access_token_found',
    GOOGLE_ACCESS_TOKEN_EXPIRED: 'google_access_token_expired',
} as const;