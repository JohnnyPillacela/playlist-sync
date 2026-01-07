// /components/playlist-table.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Image from "next/image";
import { NormalizedPlaylist } from "@/lib/types";

interface PlaylistTableProps {
  playlists: NormalizedPlaylist[];
  provider: "spotify" | "youtube-music";
}

export default function PlaylistTable({
  playlists,
  provider,
}: PlaylistTableProps) {
  const providerName = provider === "spotify" ? "Spotify" : "YouTube Music";

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Your {providerName} Playlists</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">No.</TableHead>
              <TableHead className="text-left">Thumbnail</TableHead>
              <TableHead>Playlist Name</TableHead>
              <TableHead className="text-right">Songs</TableHead>
              <TableHead className="text-right">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map(
              (playlist: NormalizedPlaylist, index: number = 0) => {
                const totalItems = playlist.trackCount || 0;
                const thumbnailUrl = playlist.thumbnailUrl || "Undefined";

                return (
                  <TableRow key={playlist.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="flex justify-center">
                      <div className="w-20 h-20 overflow-hidden">
                        <Image
                          src={thumbnailUrl}
                          alt={playlist.name}
                          width={80}
                          height={80}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {playlist.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {totalItems} {totalItems === 1 ? "song" : "songs"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {playlist.id}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
