// /api/transfer/spotify-to-youtube

import { SpotifyTrackProviderImpl } from "@/lib/providers/spotify/SpotifyTrackProviderImpl";
import { YoutubePlaylistProviderImpl } from "@/lib/providers/youtube/YoutubePlaylistProviderImpl";
import { YoutubeSearchProviderImpl } from "@/lib/providers/youtube/YoutubeSearchProviderImpl";
import { YoutubeTrackProviderImpl } from "@/lib/providers/youtube/YoutubeTrackProviderImpl";
import { SpotifyToYoutubeTransfer } from "@/lib/transfer/SpotifyToYoutubeTransfer";
import { SDK_ERRORS } from "@/lib/types";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const { playlistId, playlistName, playlistDescription } = await request.json();

        // Validate required fields
        if (!playlistId || !playlistName) {
            return NextResponse.json(
                { error: "playlistId and playlistName are required" },
                { status: 400 }
            );
        }

        const spotifyToYoutubeTransfer = new SpotifyToYoutubeTransfer(
            new SpotifyTrackProviderImpl(),
            new YoutubeTrackProviderImpl(),
            new YoutubeSearchProviderImpl(),
            new YoutubePlaylistProviderImpl(),
        );

        const transferResult = await spotifyToYoutubeTransfer.transfer({
            playlistId,
            playlistName,
            playlistDescription,
        });

        if (!transferResult.ok) {
            return NextResponse.json(
                { error: transferResult.error },
                { status: 500 }
            );
        }

        const { data } = transferResult;

        if (!data.success) {
            return NextResponse.json(
                { error: SDK_ERRORS.TRANSFER_SERVICE_ERROR },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to process transfer request";
        console.error("Error in /api/transfer/spotify-to-youtube:", errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}