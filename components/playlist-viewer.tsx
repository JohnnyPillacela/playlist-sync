// /components/playlist-viewer.tsx
'use client';

import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import PlaylistCarousel from "./playlist-carousel";
import { SongCard } from "./song-card";
import { useEffect, useState } from "react";

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
    const [songs, setSongs] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true); // Start as loading

    const playlistId = "5Iavgt4CvEYZ2tJXfyqNPw"
    
    useEffect(() => {
        // This function runs when the component mounts
        async function fetchTracks() {
            setLoading(true); // Start loading
            const tracks = await getPlaylistTracks(playlistId);
            setSongs(tracks); // Update state with the fetched tracks
            setLoading(false); // Done loading
        }
        
        fetchTracks(); // Call the function
    }, []); // Empty array = only run once when component mounts

    return (
        <>
            <div className="w-3/4 mx-auto mt-4">
                <PlaylistCarousel playlists={playlists} />
            </div>

            <div className="w-3/4 mx-auto mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {songs.map((track: Track) => (
                        <SongCard key={track.id} track={track} />
                    ))}
                </div>
            </div>
        </>
    )
}