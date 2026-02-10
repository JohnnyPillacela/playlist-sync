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
import { ListMusic } from "lucide-react";
import TransferButton from "./transfer-button";

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
        {/* <Table className="table-fixed w-full"> */}
        <Table className="table-fixed w-full min-w-[500px] sm:min-w-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%] text-left">No.</TableHead>
              <TableHead className="w-[20%] text-left">Thumbnail</TableHead>
              <TableHead className="w-[30%] text-left">Playlist Name</TableHead>
              <TableHead className="w-[20%] text-right"># of Songs</TableHead>
              <TableHead className="w-[20%] text-right">Transfer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map(
              (playlist: NormalizedPlaylist, index: number = 0) => {
                const totalItems = playlist.trackCount || 0;
                const thumbnailUrl = playlist.thumbnailUrl || null;

                return (
                  <TableRow key={playlist.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="flex justify-center">
                      <div className="w-20 h-20 overflow-hidden">
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt={playlist.name}
                            width={80}
                            height={80}
                            unoptimized={provider === "youtube-music"}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ListMusic className="w-20 h-20 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium whitespace-normal wrap-break-word min-w-0">
                      {playlist.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {totalItems} {totalItems === 1 ? "song" : "songs"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <TransferButton transferRequest={{ playlistId: playlist.id, playlistName: playlist.name }} />
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
