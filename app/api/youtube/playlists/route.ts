// /api/youtube/playlists

import { Result } from "@/lib/types";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { NextRequest, NextResponse } from "next/server";
import { getYoutubeUserPlaylists } from "@/lib/youtube/playlists";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const youtubePlaylistsResult: Result<youtube_v3.Schema$Playlist[]> = await getYoutubeUserPlaylists();

    if (!youtubePlaylistsResult.ok) {
        return NextResponse.json(
            { error: youtubePlaylistsResult.error },
            { status: 500 }
        );
    }

    const youtubePlaylists = youtubePlaylistsResult.data;
    return NextResponse.json({ youtubePlaylists });
}