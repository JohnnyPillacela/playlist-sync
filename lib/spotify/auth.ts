// /lib/spotify/auth.ts

import { cookies } from "next/headers";
import { SpotifyUser } from "../constants/spotify";
import { getServerSDK } from "./sdk";
import { UserProfile } from "@spotify/web-api-ts-sdk";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL;

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        'grant_type': 'client_credentials'
    },
    json: true
};

// Overloaded function signatures
export async function _fetchTokenDetails(): Promise<any>;
export async function _fetchTokenDetails(customAuthOptions: any): Promise<any>;
export async function _fetchTokenDetails(customAuthOptions?: any): Promise<any> {
    const options = customAuthOptions || authOptions;
    
    const response = await fetch(options.url, {
        method: 'POST',
        headers: options.headers,
        body: new URLSearchParams(options.body).toString(),
    });
    const data = await response.json();
    return data;
}

export async function _getCurrentUserProfile(): Promise<UserProfile> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
        throw new Error('No access token found in cookies');
    }

    // Use Spotify SDK to fetch current user profile
    const sdk = await getServerSDK();
    return await sdk.currentUser.profile();
}

export async function _getCurrentUserDetails(): Promise<SpotifyUser> {
    const currentUser = await _getCurrentUserProfile();

    if (!currentUser) {
        throw new Error('No current user found');
    }

    const user: SpotifyUser = {
        id: currentUser.id,
        country: currentUser.country,
        display_name: currentUser.display_name,
        email: currentUser.email,
        external_url: currentUser.external_urls?.spotify || '', // Extract spotify URL from external_urls object
        followers: currentUser.followers?.total || 0, // Extract total from followers object
        href: currentUser.href,
        product: currentUser.product,
        type: currentUser.type,
        uri: currentUser.uri,
    };

    return user;
}

export async function _exchangeCodeForTokens(
    code: string, 
    codeVerifier: string): 
    Promise<{ access_token: string, refresh_token: string, expires_in: number }> {
    
    if (!SPOTIFY_CLIENT_ID || !BASE_URL) {
        throw new Error('Required environment variables are not set');
    }

    // Exchange the authorization code for tokens via Spotify's token endpoint
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            code_verifier: codeVerifier, // PKCE: verifies we own the code challenge
            redirect_uri: `${BASE_URL}/api/spotify/callback`, // Must match the redirect_uri used in authorization
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const data = await response.json();

    return data;
}
