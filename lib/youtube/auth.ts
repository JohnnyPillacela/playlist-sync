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