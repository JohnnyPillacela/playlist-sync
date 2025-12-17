// app/dashboard/page.tsx

import { Song } from "@/lib/constants/song";
import { SongCard } from "@/components/song-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { _getCurrentUser } from "@/lib/spotify/auth";

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
    
    let name = 'Unknown';
    let email = 'unknown@example.com';
    
    try {
        const user = await _getCurrentUser();
        name = user.display_name || name
        email = user.email || email;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
    return (
        <div className="min-h-screen bg-background">
            <div className="w-3/4 mx-auto mt-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Welcome back, {name}!</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Here's your playlist overview
                            <br />
                            <span className="text-sm text-muted-foreground">
                                {email}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-4xl font-bold text-primary">{songs.length}</span>
                                <span className="text-sm text-muted-foreground mt-1">Total Songs</span>
                            </div>
                            <div className="h-12 w-px bg-border"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-semibold">{songs.length > 0 ? 'Active' : 'Empty'}</span>
                                <span className="text-sm text-muted-foreground mt-1">Playlist Status</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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