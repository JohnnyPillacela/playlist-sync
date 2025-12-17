// /lib/spotify/authorize.ts

"use client";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_CLIENT_ID_CLIENT = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    
    // Use crypto API - works in browser context
    const crypto = window.crypto || (globalThis as any).crypto;
    if (!crypto || !crypto.subtle) {
        throw new Error('Web Crypto API is not available. Make sure you are running in a secure context (HTTPS or localhost).');
    }
    
    return crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Helper function to set cookie
const setCookie = (name: string, value: string, maxAge: number = 600) => {
    // Only use Secure flag in production (HTTPS), not on localhost
    const isProduction = window.location.protocol === 'https:';
    const secureFlag = isProduction ? '; Secure' : '';
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
};

export async function redirectToSpotifyAuth(): Promise<void> {
    const codeVerifier = generateRandomString(64);
    const state = generateRandomString(16);
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    setCookie('code_verifier', codeVerifier);
    setCookie('state', state);

    // Throws an error if the environment variables are not set
    if (!SPOTIFY_CLIENT_ID_CLIENT || !BASE_URL) {
        throw new Error('Required environment variables are not set');
    }

    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';
    const authUrl = new URL(AUTH_URL);

    const redirectUri = `${BASE_URL}/api/spotify/callback`;
    console.log('Redirect URI being sent:', redirectUri);
    
    const params = {
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID_CLIENT,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
        state: state,
    }

    authUrl.search = new URLSearchParams(params).toString();
    const fullAuthUrl = authUrl.toString();
    window.location.href = fullAuthUrl;
}

