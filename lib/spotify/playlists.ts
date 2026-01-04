// /lib/spotify/playlists.ts

import { _getCurrentUserDetails } from "./auth";
import { cookies } from "next/headers";
import { getServerSDK } from "./sdk";
import { MaxInt, Page, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { SPOTIFY_ACCESS_TOKEN_KEY } from "../constants/spotify";
import { Result } from "../types";

export async function _fetchPlaylistTracks(playlistID: string, spotifyAccessToken: string) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`,
        },
    });
    const data = await response.json();

    return data;
}

export async function _fetchPlaylistTracksSDK(playlistID: string): Promise<Result<Track[]>> {
    const sdkResult = await getServerSDK();
    if (!sdkResult.ok) {
        return {
            ok: false,
            error: sdkResult.error
        }
    }
    const sdk = sdkResult.data;
    const allTracks: Track[] = [];
    let offset = 0;
    let limit = 100;

    while (true) {
        const page = await sdk.playlists.getPlaylistItems(
            playlistID,
            undefined,
            undefined,
            limit as MaxInt<50>,
            offset,
        );

        // Add tracks from this page to the allTracks array
        const tracks = page.items
            .map(item => item.track as Track)
            .filter(track => track !== null);
        
        allTracks.push(...tracks);

        if (!page.next){
            break;
        }

        offset += limit;
    }

    return {
        ok: true,
        data: allTracks
    }
}

export async function _fetchUsersPlaylists(): Promise<Result<SimplifiedPlaylist[]>> {
    const sdkResult = await getServerSDK();
    if (!sdkResult.ok) {
        return {
            ok: false,
            error: sdkResult.error
        }
    }

    const sdk = sdkResult.data;

    const response: Page<SimplifiedPlaylist> = await sdk.currentUser.playlists.playlists(50);

    const simplifiedPlaylists: SimplifiedPlaylist[] = response.items;

    return {
        ok: true,
        data: simplifiedPlaylists
    }
}