// /app/api/spotify/playlists/[playlistId]/tracks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { _fetchPlaylistTracksSDK } from "@/lib/spotify/playlists";

export async function GET(request: NextRequest, { params }: { params: Promise<{ playlistId: string }> }) {
    try {
        const { playlistId } = await params;

        if (!playlistId) {
            return NextResponse.json(   
                { error: "Playlist ID is required" },
                { status: 400 }
            );
        }
    
        const tracks = await _fetchPlaylistTracksSDK(playlistId);
        if (!tracks.ok) {
            return NextResponse.json(
                { error: tracks.error },
                { status: 500 }
            );
        }
        return NextResponse.json(tracks.data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch playlist tracks";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }

}