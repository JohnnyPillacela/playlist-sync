// app/dashboard/page.tsx

import { Song } from "@/lib/constants/song";
import { SongCard } from "@/components/song-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { _getCurrentUserDetails } from "@/lib/spotify/auth";
import { SpotifyUser } from "@/lib/constants/spotify";
import { _fetchUsersPlaylists } from "@/lib/spotify/playlists";

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
    return (
        <div className="min-h-screen bg-background">
            <div className="w-3/4 mx-auto mt-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Welcome back, {name}!</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Here's your playlist overview for {user?.id}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
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
                            {user?.followers !== undefined && user.followers > 0 && (
                                <>
                                    <span className="text-border">•</span>
                                    <span>{user.followers.toLocaleString()} followers</span>
                                </>
                            )}
                            {playlists.playlists.length > 0 && (
                                <>
                                    <span className="text-border">•</span>
                                    <span>{playlists.playlists.length} playlists</span>
                                </>
                            )}
                        </div>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Your Playlists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Playlist Name</TableHead>
                                    <TableHead className="text-right">Songs</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {playlists.playlists.map((playlist: any) => (
                                    <TableRow key={playlist.id}>
                                        <TableCell className="font-medium">{playlist.name}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {playlist.tracks?.total || 0} {playlist.tracks?.total === 1 ? 'song' : 'songs'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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