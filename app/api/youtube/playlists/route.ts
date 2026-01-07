// /api/youtube/playlists

import { NextResponse } from "next/server";
import { normalizedYoutubePlaylist } from "@/lib/youtube/playlists";

export async function GET() {
    const youtubePlaylistsResult = await normalizedYoutubePlaylist();
    if (!youtubePlaylistsResult.ok) {
        return NextResponse.json({ error: youtubePlaylistsResult.error }, { status: 500 });
    }
    return NextResponse.json(youtubePlaylistsResult.data);
}