// /components/playlist-viewer.tsx

import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import PlaylistCarousel from "./playlist-carousel";
import { _fetchPlaylistTracksSDK } from "@/lib/spotify/playlists";
import { SongCard } from "./song-card";

interface PlaylistViewerProps {
    playlists: SimplifiedPlaylist[];
}

export default async function PlaylistViewer({ playlists }: PlaylistViewerProps) {
    const playlistID = "5Iavgt4CvEYZ2tJXfyqNPw"
    const songs = await _fetchPlaylistTracksSDK(playlistID);

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