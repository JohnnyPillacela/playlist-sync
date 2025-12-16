// /components/song-card.tsx

import { Song } from "@/lib/constants/song";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function SongCard({ song }: { song: Song }) {
    return (
        <Card key={song.id}>
            <CardHeader>
                <CardTitle>{song.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <Image src={song.trackAlbumImageUrl} alt={song.name} width={100} height={100} />
                <p>{song.artists.join(', ')}</p>
            </CardContent>
        </Card>
    )
}