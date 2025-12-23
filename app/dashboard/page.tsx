// app/dashboard/page.tsx

import { SongCard } from "@/components/song-card";
import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { SpotifyUser } from "@/lib/constants/spotify";
import { _fetchPlaylistTracksSDK, _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import PleaseSignIn from "@/components/please-sign-in";
import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import PlaylistCarousel from "@/components/playlist-carousel";
import GreetUserCard from "@/components/GreetUserCard";
import PlaylistViewer from "@/components/playlist-viewer";

export default async function Dashboard() {
    let user: SpotifyUser | null = null;
    let playlists: SimplifiedPlaylist[] = [];
    
    try {
        user = await _getCurrentUserDetails();
        playlists = await _fetchUsersPlaylists();
    } catch (error) {
        console.error('Error fetching user:', error);
    }

    // Show "not signed in" view if user is null
    if (!user) {
        return (
            <PleaseSignIn musicProvider="Spotify" />
        );
    }

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="w-3/4 mx-auto mt-8 mb-8">
                <GreetUserCard user={user} playlists={playlists.length} />
            </div>

            <PlaylistViewer playlists={playlists} />

        </div>
    )
}