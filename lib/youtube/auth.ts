// /lib/youtube/auth.ts
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube";

/**
 * Create a reusable OAuth2 client
 */
function createOAuth2Client(): OAuth2Client {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
        throw new Error("Missing Google OAuth environment variables");
    }

    return new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );
}

/**
 * Build the Google OAuth authorization URL
 * (used by callback route: /api/youtube/auth)
 */
export function getYoutubeAuthUrl(): string {
    const client = createOAuth2Client();

    return client.generateAuthUrl({
        access_type: "offline",     // REQUIRED for refresh token
        prompt: "consent",          // REQUIRED to always get refresh token
        scope: [YOUTUBE_SCOPE],
    });
}

/**
 * Exchange authorization code for access + refresh tokens
 * (used by /api/youtube/callback)
 */
export async function exchangeCodeForYoutubeTokens(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
}> {
    const client = createOAuth2Client();

    const { tokens } = await client.getToken(code);

    if (!tokens.access_token || !tokens.expiry_date) {
        throw new Error("Failed to retrieve YouTube access token");
    }

    return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined, // ⚠️ only returned on first consent
        expires_in: Math.floor(
            (tokens.expiry_date - Date.now()) / 1000
        ),
    };
}

/**
 * Refresh an expired YouTube access token
 */
export async function refreshYoutubeAccessToken(
    refreshToken: string
): Promise<{
    access_token: string;
    expires_in: number;
}> {
    const client = createOAuth2Client();

    client.setCredentials({
        refresh_token: refreshToken,
    });

    const { credentials } = await client.refreshAccessToken();

    if (!credentials.access_token || !credentials.expiry_date) {
        throw new Error("Failed to refresh YouTube access token");
    }

    return {
        access_token: credentials.access_token,
        expires_in: Math.floor(
            (credentials.expiry_date - Date.now()) / 1000
        ),
    };
}