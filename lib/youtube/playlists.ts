// /lib/youtube/playlists.ts

import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { Result } from "../types";
import { getYoutubeSDK } from "./sdk";

export async function getYoutubeUserPlaylists(): Promise<Result<youtube_v3.Schema$Playlist[]>> {
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
        const response: youtube_v3.Schema$PlaylistListResponse = (await youtubeSdk.playlists.list({
            part: ['snippet', 'contentDetails'],
            mine: true,
            maxResults: 50,
            pageToken: pageToken,
        })).data;

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

    return {
        ok: true,
        data: youtubePlaylists,
    }
}