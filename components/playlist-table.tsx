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
              <TableHead>Playlist Name</TableHead>
              <TableHead className="text-right">Songs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map((playlist: any) => (
              <TableRow key={playlist.id}>
                <TableCell className="font-medium">{playlist.name}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {playlist.tracks?.total || 0}{" "}
                  {playlist.tracks?.total === 1 ? "song" : "songs"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
