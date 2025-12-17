// /lib/spotify/auth.ts

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

/**
 * Retrieves the current user from the Spotify API.
 * 
 * @param accessToken - The access token to use for the request
 * @returns The current user
 */
export async function _getCurrentUser(accessToken: string | null | undefined): Promise<any> {
    if (!accessToken) {
        throw new Error('No access token found');
    }

    const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
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
