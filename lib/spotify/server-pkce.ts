// /lib/spotify/server-pkce.ts

// Server-side implementation of Spotify PKCE authentication
// Uses Node.js crypto APIs instead of browser APIs

import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import { Result } from '../types';

const AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const BASE_URL = process.env.BASE_URL;

/**
 * Generate a random string for PKCE code verifier and state
 * Server-side version using Node.js crypto
 */
const generateRandomString = (length: number): string => {
    return randomBytes(length)
        .toString('base64url')
        .slice(0, length);
};

/**
 * Create SHA-256 hash of the code verifier
 * Server-side version using Node.js crypto
 */
const sha256 = (plain: string): string => {
    return createHash('sha256')
        .update(plain)
        .digest('base64url');
};

/**
 * Generate Spotify authorization URL with PKCE parameters
 * Sets HTTP-only cookies for code_verifier and state
 * Returns the authorization URL to redirect to
 */
export async function generateSpotifyAuthUrl(): Promise<Result<string>> {
    // Generate PKCE parameters
    const codeVerifier = generateRandomString(64);
    const state = generateRandomString(16);
    const codeChallenge = sha256(codeVerifier);

    // Validate environment variables
    if (!SPOTIFY_CLIENT_ID || !BASE_URL) {
        return {
            ok: false,
            error: 'Required environment variables (SPOTIFY_CLIENT_ID, BASE_URL) are not set'
        };
    }

    // Set HTTP-only cookies (more secure than client-side cookies)
    const cookieStore = await cookies();
    cookieStore.set('code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });

    cookieStore.set('state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });

    // Build Spotify authorization URL
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';
    const authUrl = new URL(AUTH_URL);
    const redirectUri = `${BASE_URL}/api/spotify/callback`;

    const params = {
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
        state: state,
    };

    authUrl.search = new URLSearchParams(params).toString();
    const fullAuthUrl = authUrl.toString();

    return {
        ok: true,
        data: fullAuthUrl
    };
}
