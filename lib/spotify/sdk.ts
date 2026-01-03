// /lib/spotify/sdk.ts

import { SpotifyApi, AccessToken } from '@spotify/web-api-ts-sdk';
import { cookies } from 'next/headers';
import { SPOTIFY_ACCESS_TOKEN_KEY, SPOTIFY_REFRESH_TOKEN_KEY } from '../constants/spotify';

/**
 * Creates a Spotify SDK instance using the Spotify access token from cookies.
 * This allows us to use the SDK for API calls while keeping our custom PKCE auth flow.
 * 
 * @returns {Promise<SpotifyApi>} Initialized Spotify SDK instance
 * @throws {Error} If no Spotify access token is found in cookies
 */
export async function getServerSDK(): Promise<SpotifyApi> {
  const cookieStore = await cookies();
  const spotifyAccessToken = cookieStore.get(SPOTIFY_ACCESS_TOKEN_KEY)?.value;
  const spotifyRefreshToken = cookieStore.get(SPOTIFY_REFRESH_TOKEN_KEY)?.value;
  
  if (!spotifyAccessToken) {
    throw new Error('No Spotify access token found');
  }
  
  // Initialize SDK with your existing token
  const token: AccessToken = {
    access_token: spotifyAccessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: spotifyRefreshToken || '', // Include refresh token if available
  };
  
  return SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID!,
    token
  );
}

