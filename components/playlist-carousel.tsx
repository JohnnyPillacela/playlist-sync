// /components/playlist-carousel.tsx

import { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface PlaylistCarouselProps {
  playlists: SimplifiedPlaylist[];
  onPlaylistClick: (playlistId: string, playlistName: string) => void;
  selectedPlaylistId?: string;
}

export default function PlaylistCarousel({ playlists, onPlaylistClick, selectedPlaylistId }: PlaylistCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        dragFree: false,
      }}
      className="w-full max-w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {playlists.map((playlist: SimplifiedPlaylist) => {
          const totalSongs = playlist.tracks?.total || 0;
          const thumbnailUrl = playlist.images?.[0]?.url || '/placeholder.png';
          const isSelected = selectedPlaylistId === playlist.id;

          return (
            <CarouselItem key={playlist.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
              <Card className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full ${isSelected ? 'ring-2 ring-primary shadow-xl' : ''}`} onClick={() => onPlaylistClick(playlist.id, playlist.name)}>
                <div className="relative w-full aspect-square">
                  <Image 
                    src={thumbnailUrl} 
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1 mb-1">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {totalSongs} {totalSongs === 1 ? "song" : "songs"}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}