// app/dashboard/page.tsx

import { Song } from "@/lib/constants/song";
import { SongCard } from "@/components/song-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { SpotifyUser } from "@/lib/constants/spotify";
import { _fetchUsersPlaylists } from "@/lib/spotify/playlists";
import PlaylistTable from "@/components/playlist-table";
import PleaseSignIn from "@/components/please-sign-in";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const playlistUrl = `${baseUrl}/api/spotify/playlists`;

const fetchSongs = async () => {
    const response = await fetch(playlistUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}

export default async function Dashboard() {
    const songs = await fetchSongs();
    
    let playlists: { total: number, playlists: any[] } = { total: 0, playlists: [] };
    let user: SpotifyUser | null = null;
    let name = 'Unknown';
    let email = 'unknown@example.com';
    
    try {
        user = await _getCurrentUserDetails();
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
        <div className="min-h-screen bg-background">
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
                                <span className="text-3xl font-bold text-primary">{playlists.total}</span>
                                <span className="text-sm text-muted-foreground mt-1">Total Playlists</span>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-3/4 mx-auto mt-4">
                <PlaylistTable playlists={playlists.playlists} />
            </div>

            <div className="w-3/4 mx-auto mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {songs.map((song: Song) => (
                        <SongCard key={song.id} song={song} />  
                    ))}
                </div>
            </div>

        </div>
    )
}