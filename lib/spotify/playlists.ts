// /lib/spotify/playlists.ts

import { _getCurrentUserDetails } from "./auth";
import { cookies } from "next/headers";
import { getServerSDK } from "./sdk";
import { Page, PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";

export async function _fetchPlaylistTracks(playlistID: string, accessToken: string) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();

    return data;
}

export async function _fetchPlaylistTracksSDK(playlistID: string) {
    const sdk = await getServerSDK();
    const playlistedTrackInfo: Page<PlaylistedTrack> = await sdk.playlists.getPlaylistItems(playlistID);
    const playlistedTrackInfoItems: PlaylistedTrack[] = playlistedTrackInfo.items;
    const trackItems: Track[] = playlistedTrackInfoItems.map((item) => item.track as Track);
    return trackItems;
}

export async function _fetchUsersPlaylists(): Promise<SimplifiedPlaylist[]> {
    const currentUser = await _getCurrentUserDetails();

    if(!currentUser){
        throw new Error('No current user found');
    }

    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if(!access_token){
        throw new Error('No access token found');
    }

    const sdk = await getServerSDK();
    const response: Page<SimplifiedPlaylist> = await sdk.currentUser.playlists.playlists(50);

    const simplifiedPlaylists: SimplifiedPlaylist[] = response.items;

    return simplifiedPlaylists;
}