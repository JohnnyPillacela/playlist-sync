// /api/youtube/playlists

import { NextResponse } from "next/server";
import { YoutubePlaylistProviderImpl } from "@/lib/providers/youtube/YoutubePlaylistProviderImpl";

export async function GET() {
    const youtubePlaylistProvider = new YoutubePlaylistProviderImpl();
    const normalizedPlaylistsResult = await youtubePlaylistProvider.getUserPlaylists();
    if (!normalizedPlaylistsResult.ok) {
        return NextResponse.json({ error: normalizedPlaylistsResult.error }, { status: 500 });
    }
    return NextResponse.json(normalizedPlaylistsResult.data);
}

export async function POST(request: Request) {
    const { name, description } = await request.json();
    const youtubePlaylistProvider = new YoutubePlaylistProviderImpl();
    const playlistCreationResult = await youtubePlaylistProvider.createPlaylist(name, description);
    if (!playlistCreationResult.ok) {
        return NextResponse.json({ error: playlistCreationResult.error }, { status: 500 });
    }
    return NextResponse.json(playlistCreationResult.data);
}