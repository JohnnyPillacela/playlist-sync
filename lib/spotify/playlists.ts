// /lib/spotify/playlists.ts

import { _getCurrentUserDetails } from "./auth";
import { cookies } from "next/headers";

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

export async function _fetchUsersPlaylists() {
    const currentUser = await _getCurrentUserDetails();

    if(!currentUser){
        throw new Error('No current user found');
    }

    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if(!access_token){
        throw new Error('No access token found');
    }

    const userId = currentUser.id;

    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch playlists for user ${currentUser.display_name}`);
    }

    const data = await response.json();

    const playlistDetails: { total: number, playlists: any[] } = { total: 0, playlists: [] };
    const playlists: any[] = data.items;

    playlistDetails.total = data.total;
    playlistDetails.playlists = playlists;

    return playlistDetails;
}