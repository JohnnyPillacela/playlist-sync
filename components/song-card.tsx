// /components/song-card.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Track } from "@spotify/web-api-ts-sdk";


export function SongCard({track}: {track: Track}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="line-clamp-2">{track.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                        src={track.album.images[0].url || ''} 
                        alt={`Album cover for ${track.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                        loading="lazy"
                    />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {track.artists.map((artist) => artist.name).join(', ')}
                </p>
            </CardContent>
        </Card>
    )
}