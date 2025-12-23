// app/dashboard/page.tsx

import { SongCard } from "@/components/song-card";
import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { SpotifyUser } from "@/lib/constants/spotify";
import { _fetchPlaylistTracksSDK, _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import PleaseSignIn from "@/components/please-sign-in";
import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import PlaylistCarousel from "@/components/playlist-carousel";
import GreetUserCard from "@/components/GreetUserCard";

export default async function Dashboard() {
    const playlistID = "5Iavgt4CvEYZ2tJXfyqNPw"
    
    let playlists: SimplifiedPlaylist[] = [];
    let user: SpotifyUser | null = null;
    let name = 'Unknown';
    let email = 'unknown@example.com';
    let songs: Track[] = [];
    
    try {
        user = await _getCurrentUserDetails();
        songs = await _fetchPlaylistTracksSDK(playlistID);
        playlists = await _fetchUsersPlaylists();
        name = user?.display_name || name
        email = user?.email || email;
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
                <GreetUserCard name={name} email={email} country={user?.country || ''} product={user?.product || ''} playlists={playlists.length} />
            </div>

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

        </div>
    )
}