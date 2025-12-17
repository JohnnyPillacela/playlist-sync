// /api/spotify/auth

import { _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const playlists = await _fetchUsersPlaylists(); // Reads access token from cookies automatically
        return NextResponse.json(playlists);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in /api/spotify/auth:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}
