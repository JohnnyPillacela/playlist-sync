// /components/playlist-viewer.tsx
'use client';

import PlaylistTable from "./playlist-table";
import { PlaylistProviderData } from "@/lib/types";

interface PlaylistViewerProps {
    providerData: PlaylistProviderData[];
}

export default function PlaylistViewer({ providerData }: PlaylistViewerProps) {

    const spotifyProvider = providerData.find((provider) => provider.service === "spotify");
    const spotifyPlaylists = spotifyProvider ? spotifyProvider.playlists : [];
    const youtubeProvider = providerData.find((provider) => provider.service === "youtube-music");
    const youtubePlaylists = youtubeProvider ? youtubeProvider.playlists : [];

    return (
        <>
            <div className="w-3/4 mx-auto mt-4 flex flex-row gap-4">
                <div className="flex-1 min-w-0">
                    <PlaylistTable playlists={spotifyPlaylists} provider="spotify" />
                </div>
                <div className="flex-1 min-w-0">
                    <PlaylistTable playlists={youtubePlaylists} provider="youtube-music" />
                </div>
            </div>
        </>
    )
}