// app/dashboard/page.tsx

import { Song } from "@/lib/constants/song";

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
            <ul>
                {songs.map((song: Song) => (
                    <li key={song.name}>{song.name} - {song.artists.join(', ')}</li>
                ))}
            </ul>
        </div>
    )
}