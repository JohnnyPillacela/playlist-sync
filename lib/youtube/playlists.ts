// /lib/youtube/playlists.ts

import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { Result } from "../types";
import { getYoutubeSDK } from "./sdk";
import { handleYouTubeAPIError } from "./errorHandler";
import { youtubeCache } from "./cache";
import { PLAYLISTS_TTL_SECONDS, YOUTUBE, CACHE_MESSAGES } from "../cache/constants";
import { getFromCaches, setCaches } from "../cache/layers";
import { getUserCacheKey } from "./cache";

const YOUTUBE_PLAYLISTS_NAME = '[YouTube Playlists]';

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
    const cacheKey = `${YOUTUBE.PLAYLIST_NAMESPACE}:${userKey}`;

    // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
    const cachedPlaylists = await getFromCaches<youtube_v3.Schema$Playlist[]>(
        cacheKey,
        YOUTUBE_PLAYLISTS_NAME,
        youtubeCache.playlists
    );
    if (cachedPlaylists) {
        return {
            ok: true,
            data: cachedPlaylists,
        }
    }

    console.log(`${YOUTUBE_PLAYLISTS_NAME} ${CACHE_MESSAGES.FETCHING_FROM_API}`);

    // 3. Fetch from API
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

    // Set in caches before returning
    await setCaches(cacheKey, YOUTUBE_PLAYLISTS_NAME, youtubeCache.playlists, youtubePlaylists, PLAYLISTS_TTL_SECONDS);

    console.log(`${YOUTUBE_PLAYLISTS_NAME} Cached ${youtubePlaylists.length} playlists`);

    return {
        ok: true,
        data: youtubePlaylists,
    }
}
