// app/dashboard/page.tsx

import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import PleaseSignIn from "@/components/please-sign-in";
import GreetUserCard from "@/components/GreetUserCard";
import PlaylistViewer from "@/components/playlist-viewer";

export default async function Dashboard() {
    const userResult = await _getCurrentUserDetails();
    
    // Show "not signed in" view if user is null
    if (!userResult.ok) {
        return (
            <PleaseSignIn musicProvider="Spotify" />
        );
    }
    const user = userResult.data;

    const playlistsResult = await _fetchUsersPlaylists();
    const playlists = playlistsResult.ok ? playlistsResult.data : [];

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="w-3/4 mx-auto mt-8 mb-8">
                <GreetUserCard user={user} playlists={playlists.length} />
            </div>

            <PlaylistViewer playlists={playlists} />

        </div>
    )
}