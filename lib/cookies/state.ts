// /lib/cookies/state.ts

import { SPOTIFY_ACCESS_TOKEN_KEY, SPOTIFY_REFRESH_TOKEN_KEY } from "../constants/spotify";
import { GOOGLE_ACCESS_TOKEN_KEY, GOOGLE_REFRESH_TOKEN_KEY } from "../constants/google";

/**
 * Deletes Spotify and Google access tokens from response cookies.
 * Call this in your API Route when logging out or revoking access.
 * 
 * @param {Response | NextResponse} response - The response object to mutate.
 */
export function deleteAuthCookies(response: any) {
    // Spotify tokens (customize the key names if needed)
    response.cookies.delete(SPOTIFY_ACCESS_TOKEN_KEY);
    response.cookies.delete(SPOTIFY_REFRESH_TOKEN_KEY);

    // Google tokens (customize the key names if needed)
    response.cookies.delete(GOOGLE_ACCESS_TOKEN_KEY);
    response.cookies.delete(GOOGLE_REFRESH_TOKEN_KEY);
}
