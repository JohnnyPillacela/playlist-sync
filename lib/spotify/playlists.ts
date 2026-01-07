// /lib/spotify/playlists.ts

import { getServerSDK } from "./sdk";
import { MaxInt, Page, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { NormalizedPlaylist, Result } from "../types";

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

        if (!page.next) {
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

export async function normalizedSpotifyPlaylist(): Promise<Result<NormalizedPlaylist[]>> {
    const spotifyPlaylistsResult = await _fetchUsersPlaylists();

    if (!spotifyPlaylistsResult.ok) {
        return {
            ok: false,
            error: spotifyPlaylistsResult.error
        }
    }

    const spotifyPlaylists = spotifyPlaylistsResult.data;

    const normalizedPlaylists: NormalizedPlaylist[] = spotifyPlaylists.map((playlist) => {
        return {
            id: playlist.id,
            name: playlist.name,
            trackCount: playlist.tracks?.total || 0,
            thumbnailUrl: playlist.images?.[0]?.url || 'Undefined',
            provider: 'spotify'
        }
    })

    return {
        ok: true,
        data: normalizedPlaylists
    }
}