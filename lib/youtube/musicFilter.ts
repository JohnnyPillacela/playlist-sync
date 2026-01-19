// /lib/youtube/musicFilter.ts

import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { Result } from "../types";
import { getYoutubeSDK } from "./sdk";
import { handleYouTubeAPIError } from "./errorHandler";

/**
 * Pull up to `maxItemsToInspect` videoIds from a playlist.
 * We don't need the entire playlist to decide if it's "music-y".
 */
export async function getPlaylistVideoIds(
    playlistId: string,
    maxItemsToInspect = 100
): Promise<Result<string[]>> {
    const youtubeSDKResult: Result<youtube_v3.Youtube> = await getYoutubeSDK();
    if (!youtubeSDKResult.ok) return { ok: false, error: youtubeSDKResult.error };

    const youtube = youtubeSDKResult.data;

    const videoIds: string[] = [];
    let pageToken: string | undefined;

    while (videoIds.length < maxItemsToInspect) {
        let resp;
        try {
            resp = (await youtube.playlistItems.list({
                part: ["contentDetails"], // contentDetails.videoId is the simplest
                playlistId,
                maxResults: 50,
                pageToken,
            })).data;
        } catch (error: any) {
            return handleYouTubeAPIError(error);
        }

        for (const item of resp.items ?? []) {
            const vid = item.contentDetails?.videoId;
            if (vid) videoIds.push(vid);
            if (videoIds.length >= maxItemsToInspect) break;
        }

        if (!resp.nextPageToken) break;
        pageToken = resp.nextPageToken;
    }

    return { ok: true, data: videoIds };
}

/**
 * Fetch snippet.categoryId for videoIds (batching in chunks of 50).
 * categoryId "10" = Music
 */
export async function getVideoCategoryIds(
    videoIds: string[]
): Promise<Result<Record<string, string>>> {
    const youtubeSDKResult: Result<youtube_v3.Youtube> = await getYoutubeSDK();
    if (!youtubeSDKResult.ok) return { ok: false, error: youtubeSDKResult.error };

    const youtube = youtubeSDKResult.data;

    const map: Record<string, string> = {};

    const chunkSize = 50;
    for (let i = 0; i < videoIds.length; i += chunkSize) {
        const chunk = videoIds.slice(i, i + chunkSize);

        let resp;
        try {
            resp = (await youtube.videos.list({
                part: ["snippet"],
                id: chunk,
                maxResults: 50,
            })).data;
        } catch (error: any) {
            return handleYouTubeAPIError(error);
        }

        for (const v of resp.items ?? []) {
            const id = v.id;
            const categoryId = v.snippet?.categoryId;
            if (id && categoryId) map[id] = categoryId;
        }
    }

    return { ok: true, data: map };
}

/**
 * Heuristic: decide if a playlist is "YouTube Music-like"
 * by checking what % of its inspected videos are categoryId "10".
 */
export async function isMusicPlaylist(
    playlistId: string,
    opts?: {
        maxItemsToInspect?: number;
        minMusicRatio?: number; // e.g. 0.7 => 70% music
        minInspected?: number;  // require at least N categorized videos
    }
): Promise<Result<boolean>> {
    const maxItemsToInspect = opts?.maxItemsToInspect ?? 100;
    const minMusicRatio = opts?.minMusicRatio ?? 0.7;
    const minInspected = opts?.minInspected ?? 10;

    const idsResult = await getPlaylistVideoIds(playlistId, maxItemsToInspect);
    if (!idsResult.ok) return { ok: false, error: idsResult.error };

    const videoIds = idsResult.data;
    if (videoIds.length === 0) return { ok: true, data: false };

    const catsResult = await getVideoCategoryIds(videoIds);
    if (!catsResult.ok) return { ok: false, error: catsResult.error };

    const categories = catsResult.data;

    let inspected = 0;
    let musicCount = 0;

    for (const id of videoIds) {
        const cat = categories[id];
        if (!cat) continue; // unavailable/deleted/private videos won't resolve
        inspected++;
        if (cat === "10") musicCount++;

        if (inspected >= minInspected) {
            const ratio = musicCount / inspected;
            if (ratio >= minMusicRatio) {
              return { ok: true, data: true };
            }
        }
    }

    // If we can't categorize enough items, don't confidently label it music
    if (inspected < minInspected) return { ok: true, data: false };

    const ratio = musicCount / inspected;
    return { ok: true, data: ratio >= minMusicRatio };
}
