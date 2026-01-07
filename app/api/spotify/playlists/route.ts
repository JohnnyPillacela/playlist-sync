// /api/spotify/playlists
import { NextResponse } from "next/server";
import { normalizedSpotifyPlaylist } from "@/lib/spotify/playlists";

export async function GET() {
    const spotifyPlaylistsResult = await normalizedSpotifyPlaylist();
    if (!spotifyPlaylistsResult.ok) {
        return NextResponse.json({ error: spotifyPlaylistsResult.error }, { status: 500 });
    }
    return NextResponse.json(spotifyPlaylistsResult.data);
}