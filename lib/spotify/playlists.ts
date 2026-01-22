// /lib/spotify/playlists.ts

import { getServerSDK } from "./sdk";
import { MaxInt, Track } from "@spotify/web-api-ts-sdk";
import { Result } from "../types";
import { CACHE_MESSAGES, PLAYLISTS_TTL_SECONDS, SPOTIFY } from "../cache/constants";
import { getFromCaches, setCaches } from "../cache/layers";
import { spotifyCache } from "./cache";
import { getUserCacheKey } from "./cache";

const SPOTIFY_PLAYLIST_TRACKS_NAME = '[Spotify Playlist Tracks]';

export async function fetchPlaylistTracksOLD(playlistID: string, spotifyAccessToken: string) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`,
        },
    });
    const data = await response.json();

    return data;
}

export async function getPlaylistTracks(playlistID: string): Promise<Result<Track[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `${SPOTIFY.PLAYLIST_TRACKS_NAMESPACE}:${userKey}`;

    const cachedTracks = await getFromCaches<Track[]>(cacheKey, SPOTIFY_PLAYLIST_TRACKS_NAME, spotifyCache.tracks);
    if (cachedTracks) {
        return {
            ok: true,
            data: cachedTracks
        }
    }

    console.log(`${SPOTIFY_PLAYLIST_TRACKS_NAME} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

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

    // Set in caches before returning
    await setCaches(cacheKey, SPOTIFY_PLAYLIST_TRACKS_NAME, spotifyCache.tracks, allTracks, PLAYLISTS_TTL_SECONDS);

    console.log(`${SPOTIFY_PLAYLIST_TRACKS_NAME} Cached ${allTracks.length} tracks`);

    return {
        ok: true,
        data: allTracks
    }
}

