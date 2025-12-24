// /components/song-table.tsx

import { Track } from "@spotify/web-api-ts-sdk";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface SongTableProps {
    tracks: Track[];
}

export function SongTable({ tracks }: SongTableProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Playlist Tracks</CardTitle>
                <CardDescription>Total tracks: {tracks.length}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Art</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Artists</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tracks.map((track, index) => (
                            <TableRow key={track.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Image src={track.album.images[0].url} alt={track.name} width={80} height={80} />
                                </TableCell>
                                <TableCell>{track.name}</TableCell>
                                <TableCell>{track.artists.map((artist) => artist.name).join(", ")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}