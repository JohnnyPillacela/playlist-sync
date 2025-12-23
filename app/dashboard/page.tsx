// app/dashboard/page.tsx

import { SongCard } from "@/components/song-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { SpotifyUser } from "@/lib/constants/spotify";
import { _fetchPlaylistTracksSDK, _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import PlaylistTable from "@/components/playlist-table";
import PleaseSignIn from "@/components/please-sign-in";
import { SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import PlaylistCarousel from "@/components/playlist-carousel";

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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-5xl font-bold">Welcome back, {name}!</CardTitle>
                        <CardDescription className="text-xl mt-2">
                            Here's your playlist overview
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-base text-muted-foreground">
                            {email && (
                                <span className="flex items-center">
                                    {email}
                                </span>
                            )}
                            {user?.country && (
                                <>
                                    <span className="text-border">•</span>
                                    <span>{user.country}</span>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-3xl font-semibold">{user?.product === 'premium' ? 'Premium' : 'Free'}</span>
                                <span className="text-sm text-muted-foreground mt-1">Subscription Status</span>
                            </div> 
                            <div className="h-12 w-px bg-border"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-primary">{playlists.length}</span>
                                <span className="text-sm text-muted-foreground mt-1">Total Playlists</span>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-3/4 mx-auto mt-4">
                <PlaylistCarousel playlists={playlists} />
            </div>

            <div className="w-3/4 mx-auto mt-4">
                <PlaylistTable playlists={playlists} />
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