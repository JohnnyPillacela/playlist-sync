// /lib/google/oauth2sdk.ts

import { cookies } from "next/headers";
import { AUTH_ERRORS, Result } from "../types";
import { GOOGLE_ACCESS_TOKEN_KEY } from "../constants/google";
import { createOAuth2Client } from "../youtube/auth";
import { google, oauth2_v2 } from "googleapis";

const GOOGLE_OAUTH2_SDK_INIT = "[GOOGLE_OAUTH2_SDK_INIT]";

/**
 * Get a Google OAuth2 SDK instance
 * @returns {Promise<Result<oauth2_v2.Oauth2>>} The Google OAuth2 SDK instance
 */
export async function getGoogleOAuth2SDK(): Promise<Result<oauth2_v2.Oauth2>> {
    const cookieStore = await cookies();
    const googleAccessToken = cookieStore.get(GOOGLE_ACCESS_TOKEN_KEY)?.value;
    if (!googleAccessToken) {
        console.error(`${GOOGLE_OAUTH2_SDK_INIT} ${AUTH_ERRORS.GOOGLE_NO_TOKEN_FOUND}`);
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

    const googleSDK = google.oauth2({
        version: 'v2',
        auth,
        rootUrl: 'https://www.googleapis.com',
    });

    // Return authenticated Google SDK instance
    return {
        ok: true,
        data: googleSDK,
    }
}