// app/dashboard/page.tsx

import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import PleaseSignIn from "@/components/please-sign-in";
import GreetUserCard from "@/components/GreetUserCard";
import PlaylistViewer from "@/components/playlist-viewer";
import { getGoogleUserInfo } from "@/lib/youtube/auth";
import { PlaylistProviderData } from "@/lib/types";

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

    const spotifyProviderData: PlaylistProviderData = {
        service: 'spotify',
        isAuthenticated: spotifyUserResult.ok,
    }
    const youtubeProviderData: PlaylistProviderData = {
        service: 'youtube-music',
        isAuthenticated: googleUserResult.ok,
    }
    const providerData: PlaylistProviderData[] = [spotifyProviderData, youtubeProviderData];

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="w-3/4 mx-auto mt-8 mb-8">
                <GreetUserCard 
                    spotifyUser={spotifyUser} 
                    googleUser={googleUser}
                />
            </div>



            <PlaylistViewer providerData={providerData} />

        </div>
    )
}