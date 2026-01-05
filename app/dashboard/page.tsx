// app/dashboard/page.tsx

import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import PleaseSignIn from "@/components/please-sign-in";
import GreetUserCard from "@/components/GreetUserCard";
import PlaylistViewer from "@/components/playlist-viewer";
import { getGoogleUserInfo } from "@/lib/youtube/auth";

export default async function Dashboard() {
    const spotifyUserResult = await _getCurrentUserDetails();
    const googleUserResult = await getGoogleUserInfo();
    
    // Show "not signed in" view only if BOTH services are not authenticated
    if (!spotifyUserResult.ok && !googleUserResult.ok) {
        return (
            <PleaseSignIn musicProvider="Spotify or Google" />
        );
    }
    
    // Extract user data from authenticated service(s)
    const spotifyUser = spotifyUserResult.ok ? spotifyUserResult.data : null;
    const googleUser = googleUserResult.ok ? googleUserResult.data : null;

    // Fetch Spotify playlists only if Spotify is authenticated
    const playlistsResult = spotifyUserResult.ok 
        ? await _fetchUsersPlaylists() 
        : { ok: false as const, error: 'Spotify not authenticated' };
    const playlists = playlistsResult.ok ? playlistsResult.data : [];

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="w-3/4 mx-auto mt-8 mb-8">
                <GreetUserCard 
                    spotifyUser={spotifyUser} 
                    googleUser={googleUser}
                    playlists={playlists.length} 
                />
            </div>

            <PlaylistViewer playlists={playlists} />

        </div>
    )
}