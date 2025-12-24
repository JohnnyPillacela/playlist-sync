// /components/playlist-viewer.tsx
'use client';

import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import PlaylistCarousel from "./playlist-carousel";
import { useEffect, useState } from "react";
import { Loader2, Music, ListMusic } from "lucide-react";   
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SongTable } from "./song-table";

interface PlaylistViewerProps {
    playlists: SimplifiedPlaylist[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
    const response = await fetch(`${baseUrl}/api/spotify/playlists/${playlistId}/tracks`, {
        method: 'GET',
        credentials: 'include', // Ensures cookies are sent
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch playlist tracks: ${errorData?.error || 'Unknown error'}`);
    }
    const data = await response.json();
    return data as Track[];
}

export default function PlaylistViewer({ playlists }: PlaylistViewerProps) {
    const [songs, setSongs] = useState<Track[] | null>(null);
    const [playlistId, setPlaylistId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handlePlaylistClick = (playlistId: string) => {
        setPlaylistId(playlistId);
    }
    
    useEffect(() => {
        // Only fetch if a playlist is selected
        if (!playlistId) return;
        
        async function fetchTracks() {
            setLoading(true);
            const tracks = await getPlaylistTracks(playlistId);
            setSongs(tracks);
            setLoading(false);
        }
        
        fetchTracks(); // Call the function
    }, [playlistId]); // Run whenever playlistId changes

    return (
        <>
            <div className="w-3/4 mx-auto mt-4">
                <PlaylistCarousel playlists={playlists} onPlaylistClick={handlePlaylistClick} />
            </div>

            <div className="w-3/4 mx-auto mt-4">
                {loading ? (
                    <div className="flex justify-center items-center my-20">
                        <div className="flex items-center gap-2 text-4xl font-bold">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <span>Loading tracks...</span>
                        </div>
                    </div>
                ) : songs === null ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia>
                                <ListMusic className="w-16 h-16" />
                            </EmptyMedia>
                            <EmptyTitle>Click a playlist to view its tracks</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : songs.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia>
                                <Music className="w-16 h-16" />
                            </EmptyMedia>
                            <EmptyTitle>This playlist is empty</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <SongTable tracks={songs} playlistId={playlistId} />
                )}
            </div>
        </>
    )
}