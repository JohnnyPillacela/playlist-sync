// /lib/spotify/sdk.ts

import { SpotifyApi, AccessToken } from '@spotify/web-api-ts-sdk';
import { cookies } from 'next/headers';

/**
 * Creates a Spotify SDK instance using the access token from cookies.
 * This allows us to use the SDK for API calls while keeping our custom PKCE auth flow.
 * 
 * @returns {Promise<SpotifyApi>} Initialized Spotify SDK instance
 * @throws {Error} If no access token is found in cookies
 */
export async function getServerSDK(): Promise<SpotifyApi> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  
  if (!accessToken) {
    throw new Error('No access token found');
  }
  
  // Initialize SDK with your existing token
  const token: AccessToken = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken || '', // Include refresh token if available
  };
  
  return SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID!,
    token
  );
}

