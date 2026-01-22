// /api/spotify/playlists
import { NextResponse } from "next/server";
import { SpotifyPlaylistProviderImpl } from "@/lib/providers/spotify/SpotifyPlaylistProviderImpl";

export async function GET() {
    const spotifyPlaylistProvider = new SpotifyPlaylistProviderImpl();
    const spotifyPlaylistsResult = await spotifyPlaylistProvider.getUserPlaylists();
    if (!spotifyPlaylistsResult.ok) {
        return NextResponse.json({ error: spotifyPlaylistsResult.error }, { status: 500 });
    }
    return NextResponse.json(spotifyPlaylistsResult.data);
}