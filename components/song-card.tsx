// /components/song-card.tsx

import { Song } from "@/lib/constants/song";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface SongCardProps {
    song: Song;
}

export function SongCard({ song }: SongCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="line-clamp-2">{song.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                        src={song.trackAlbumImageUrl} 
                        alt={`Album cover for ${song.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                        loading="lazy"
                    />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {song.artists.join(', ')}
                </p>
            </CardContent>
        </Card>
    )
}