// /lib/constants/spotify.ts

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