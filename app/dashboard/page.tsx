// app/dashboard/page.tsx

import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import PleaseSignIn from "@/components/please-sign-in";
import { ThemeToggle } from "@/components/theme-toggle";
import GreetUserCard from "@/components/GreetUserCard";
import PlaylistViewerTabs from "@/components/playlist-viewer-tabs";
import { getGoogleUserInfo } from "@/lib/youtube/auth";
import { PlaylistProviderData } from "@/lib/types";

export default async function Dashboard() {
    const spotifyUserResult = await _getCurrentUserDetails();
    const googleUserResult = await getGoogleUserInfo();
    
    // Show "not signed in" view only if BOTH services are not authenticated
    if (!spotifyUserResult.ok && !googleUserResult.ok) {
        return (
            <div className="relative min-h-screen">
                <ThemeToggle className="absolute right-4 top-4 z-10" />
                <PleaseSignIn musicProvider="Spotify or Google" />
            </div>
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
        <div className="relative pb-16">
            <ThemeToggle className="absolute right-4 top-4 z-10" />
            <div className="w-full max-w-7xl mx-auto">
                <div className="my-10 px-4 md:px-6">
                    <GreetUserCard 
                        spotifyUser={spotifyUser} 
                        googleUser={googleUser}
                    />
                    <PlaylistViewerTabs providerData={providerData} />
                </div>

            </div>
        </div>
    )
}