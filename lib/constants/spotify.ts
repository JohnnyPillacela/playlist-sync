// /lib/constants/spotify.ts

export const SPOTIFY_ACCESS_TOKEN_KEY = "spotify_access_token";
export const SPOTIFY_REFRESH_TOKEN_KEY = "spotify_refresh_token";

export type SpotifyUser = {
    id: string;
    country: string;
    display_name: string;
    email: string;
    external_url: string; // opens spotify client
    followers: number; // Total number of followers
    href: string;
    product: string;
    type: string;
    uri: string;
}