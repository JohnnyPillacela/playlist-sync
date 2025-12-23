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

export default function PlaylistTable({ playlists }: { playlists: any[] }) {
  return (
    <Card className="w-3/4 mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Your Playlists</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Thumbnail</TableHead>
              <TableHead>Playlist Name</TableHead>
              <TableHead className="text-right">Songs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map((playlist: any) => {
              const totalSongs = playlist.tracks?.total || 0;
              const thumbnailUrl = playlist.images?.[0]?.url || 'Undefined';

              return (
                <TableRow key={playlist.id}>
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
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
