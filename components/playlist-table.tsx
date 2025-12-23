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
import { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

export default function PlaylistTable({ playlists }: { playlists: SimplifiedPlaylist[] }) {
  return (
    <Card className="w-3/4 mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Your Playlists</CardTitle>
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
            {playlists.map((playlist: SimplifiedPlaylist, index: number = 0) => {
              const totalSongs = playlist.tracks?.total || 0;
              const thumbnailUrl = playlist.images?.[0]?.url || 'Undefined';

              return (
                <TableRow key={playlist.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="flex justify-center">
                    <div className="w-20 h-20 overflow-hidden">
                      <Image src={thumbnailUrl} alt={playlist.name} width={80} height={80} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{playlist.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {totalSongs}{" "}
                    {totalSongs === 1 ? "song" : "songs"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {playlist.id}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
