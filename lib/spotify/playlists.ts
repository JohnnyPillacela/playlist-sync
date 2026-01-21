// /lib/spotify/playlists.ts

import { getServerSDK } from "./sdk";
import { MaxInt, Page, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { NormalizedPlaylist, Result } from "../types";
import { CACHE_MESSAGES, NORMALIZED_PLAYLISTS_TTL_SECONDS, PLAYLISTS_TTL_SECONDS, SPOTIFY } from "../cache/constants";
import { getFromCaches, setCaches } from "../cache/layers";
import { spotifyCache } from "./cache";
import { _getCurrentUserDetails } from "./auth";
import { hash } from "../cache/keyBuilder";

const SPOTIFY_PLAYLIST_TRACKS_NAME = '[Spotify Playlist Tracks]';
const SPOTIFY_PLAYLISTS_NAME = '[Spotify Playlists]';
const SPOTIFY_NORMALIZED_PLAYLISTS_NAME = '[Spotify Normalized Playlists]';

// Get a user-specific cache key suffix based on their access token
async function getUserCacheKey(): Promise<string> {
    const currentUserDetailsResult = await _getCurrentUserDetails();
    if (!currentUserDetailsResult.ok) {
        return '';
    }
    const currentUserDetails = currentUserDetailsResult.data;
    return hash(currentUserDetails.id);
}

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

export async function getSpotifyUserPlaylists(): Promise<Result<SimplifiedPlaylist[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `${SPOTIFY.PLAYLIST_NAMESPACE}:${userKey}`;

    const cachedPlaylists = await getFromCaches<SimplifiedPlaylist[]>(cacheKey, SPOTIFY_PLAYLISTS_NAME, spotifyCache.playlists);
    if (cachedPlaylists) {
        return {
            ok: true,
            data: cachedPlaylists
        }
    }

    console.log(`${SPOTIFY_PLAYLISTS_NAME} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

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

    // Set in caches before returning
    await setCaches(cacheKey, SPOTIFY_PLAYLISTS_NAME, spotifyCache.playlists, simplifiedPlaylists, PLAYLISTS_TTL_SECONDS);

    console.log(`${SPOTIFY_PLAYLISTS_NAME} Cached ${simplifiedPlaylists.length} playlists`);

    return {
        ok: true,
        data: simplifiedPlaylists
    }
}

export async function normalizedSpotifyPlaylist(): Promise<Result<NormalizedPlaylist[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `${SPOTIFY.NORMALIZED_PLAYLISTS_NAMESPACE}:${userKey}`;

    // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
    const cachedNormalizedPlaylists = await getFromCaches<NormalizedPlaylist[]>(
        cacheKey,
        SPOTIFY_NORMALIZED_PLAYLISTS_NAME,
        spotifyCache.normalizedPlaylists,
    );
    if (cachedNormalizedPlaylists) {
        return {
            ok: true,
            data: cachedNormalizedPlaylists,
        }
    }

    console.log(`${SPOTIFY_NORMALIZED_PLAYLISTS_NAME} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

    const spotifyPlaylistsResult = await getSpotifyUserPlaylists();

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

    // Set in caches before returning
    await setCaches(cacheKey, SPOTIFY_NORMALIZED_PLAYLISTS_NAME, spotifyCache.normalizedPlaylists, normalizedPlaylists, NORMALIZED_PLAYLISTS_TTL_SECONDS);

    console.log(`${SPOTIFY_NORMALIZED_PLAYLISTS_NAME} Cached ${normalizedPlaylists.length} normalized playlists`);


    return {
        ok: true,
        data: normalizedPlaylists
    }
}