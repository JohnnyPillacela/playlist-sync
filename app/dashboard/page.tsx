// app/dashboard/page.tsx

import { Song } from "@/lib/constants/song";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

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

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Total songs: {songs.length}</p>

            <div className="w-3/4 mx-auto mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {songs.map((song: Song) => (
                        <Card key={song.id}>
                            <CardHeader>
                                <CardTitle>{song.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Image src={song.trackAlbumImageUrl} alt={song.name} width={100} height={100} />
                                <p>{song.artists.join(', ')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    )
}