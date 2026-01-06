// /lib/youtube/sdk.ts

import { google, youtube_v3 } from "googleapis";
import { cookies } from "next/headers";
import { GOOGLE_ACCESS_TOKEN_KEY } from "../constants/google";
import { AUTH_ERRORS, Result } from "../types";
import { createOAuth2Client } from "./auth";

/**
 * Creates a YouTube SDK client instance using the Google access token from cookies.
 * This allows us to use the googleapis YouTube SDK for API calls with our OAuth tokens.
 * 
 * @returns {Promise<Result<youtube_v3.Youtube>>} Initialized YouTube SDK instance or error
 */
export async function getYoutubeSDK(): Promise<Result<youtube_v3.Youtube>> {
    const cookieStore = await cookies();
    const googleAccessToken = cookieStore.get(GOOGLE_ACCESS_TOKEN_KEY)?.value;

    if (!googleAccessToken) {
        return {
            ok: false,
            error: AUTH_ERRORS.GOOGLE_NO_TOKEN_FOUND,
        }
    }

    // Create OAuth2Client and set credentials
    const auth = createOAuth2Client();
    auth.setCredentials({
        access_token: googleAccessToken,
    });

    // Return authenticated YouTube SDK instance
    const youtube = google.youtube({
        version: 'v3',
        auth
    });

    return {
        ok: true,
        data: youtube,
    }
}
