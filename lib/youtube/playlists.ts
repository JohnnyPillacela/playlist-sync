// /lib/youtube/playlists.ts

import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { NormalizedPlaylist, Result } from "../types";
import { getYoutubeSDK } from "./sdk";
import { isMusicPlaylist } from "./musicFilter";
import { handleYouTubeAPIError } from "./errorHandler";
import { youtubeCache } from "./cache";
import { cookies } from "next/headers";
import { GOOGLE_ACCESS_TOKEN_KEY } from "../constants/google";

// Get a user-specific cache key suffix based on their access token
async function getUserCacheKey(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get(GOOGLE_ACCESS_TOKEN_KEY)?.value;
    // Use last 8 chars of token as identifier (unique per user, no extra API call needed)
    return token ? token.slice(-8) : 'anonymous';
}

// Simple concurrency limiter (no dependency)
async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let i = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (true) {
            const idx = i++;
            if (idx >= items.length) break;
            results[idx] = await fn(items[idx], idx);
        }
    });

    await Promise.all(workers);
    return results;
}

export async function getYoutubeUserPlaylists(): Promise<Result<youtube_v3.Schema$Playlist[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `youtube:playlists:${userKey}`;

    // Check cache first
    const cachedPlaylists = youtubeCache.playlists.get(cacheKey);
    if (cachedPlaylists) {
        console.log(`[YouTube Playlists] Cache hit`);
        return {
            ok: true,
            data: cachedPlaylists,
        }
    }

    console.log(`[YouTube Playlists] Cache miss, fetching from API...`);

    const youtubeSDKResult: Result<youtube_v3.Youtube> = await getYoutubeSDK();
    if (!youtubeSDKResult.ok) {
        return {
            ok: false,
            error: youtubeSDKResult.error,
        }
    }

    const youtubeSdk: youtube_v3.Youtube = youtubeSDKResult.data;
    const youtubePlaylists: youtube_v3.Schema$Playlist[] = [];
    let pageToken: string | undefined = undefined;

    // Loop through all pages of playlists
    while (true) {
        let response: youtube_v3.Schema$PlaylistListResponse;
        try {
            response = (await youtubeSdk.playlists.list({
                part: ['snippet', 'contentDetails'],
                mine: true,
                maxResults: 50,
                pageToken: pageToken,
            })).data;
        } catch (error: any) {
            return handleYouTubeAPIError(error);
        }

        // Add items from this page to the youtubePlaylists array
        if (response.items) {
            youtubePlaylists.push(...response.items);
        }

        // Check if there are more pages
        if (!response.nextPageToken) {
            break;
        }

        pageToken = response.nextPageToken;
    }

    // Store in cache before returning
    youtubeCache.playlists.set(cacheKey, youtubePlaylists);
    console.log(`[YouTube Playlists] Cached ${youtubePlaylists.length} playlists`);

    return {
        ok: true,
        data: youtubePlaylists,
    }
}

export async function normalizedYoutubePlaylist(): Promise<Result<NormalizedPlaylist[]>> {
    const userKey = await getUserCacheKey();
    const cacheKey = `youtube:normalized-playlists:${userKey}`;

    // Check cache first
    const cachedNormalizedPlaylists = youtubeCache.normalizedPlaylists.get(cacheKey);
    if (cachedNormalizedPlaylists) {
        console.log(`[YouTube Normalized Playlists] Cache hit`);
        return {
            ok: true,
            data: cachedNormalizedPlaylists,
        }
    }

    console.log(`[YouTube Normalized Playlists] Cache miss, processing...`);

    const youtubePlaylistsResult = await getYoutubeUserPlaylists();

    if (!youtubePlaylistsResult.ok) {
        return {
            ok: false,
            error: youtubePlaylistsResult.error,
        }
    }

    const youtubePlaylists = youtubePlaylistsResult.data
        .filter((playlist) => playlist.id != null); // Filter out playlists without IDs

    // Decide which playlists are "music" by inspecting items
    const checks = await mapWithConcurrency(
        youtubePlaylists,
        4, // tweak: 2–6 is usually safe
        async (playlist) => {
            const id = playlist.id!;
            const res = await isMusicPlaylist(id, {
                maxItemsToInspect: 100,
                minMusicRatio: 0.7,
                minInspected: 10,
            });

            if (!res.ok) {
                // you can choose to treat errors as non-music or bubble up
                return { playlist, isMusic: false };
            }
            return { playlist, isMusic: res.data };
        }
    );

    const normalizedPlaylists: NormalizedPlaylist[] = checks
        .filter((playlist) => playlist.isMusic)
        .map(({ playlist }) => ({
            id: playlist.id!,
            name: playlist.snippet?.title || "Untitled Playlist",
            trackCount: playlist.contentDetails?.itemCount || 0,
            thumbnailUrl: playlist.snippet?.thumbnails?.default?.url || "Undefined",
            provider: "youtube-music",
        }));

    // Store in cache before returning
    youtubeCache.normalizedPlaylists.set(cacheKey, normalizedPlaylists);
    console.log(`[YouTube Normalized Playlists] Cached ${normalizedPlaylists.length} normalized playlists`);

    return {
        ok: true,
        data: normalizedPlaylists,
    }
}