// /components/song-table.tsx

import { Track } from "@spotify/web-api-ts-sdk";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Music } from "lucide-react";

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
                        {tracks.map((track, index) => {
                            const thumbnailUrl = track.album?.images?.[0]?.url;

                            return (
                                <TableRow key={track.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        {thumbnailUrl ? (
                                            <Image src={thumbnailUrl} alt={track.name} width={80} height={80} />
                                        ) : (
                                            <div className="w-20 h-20 bg-muted flex items-center justify-center rounded">
                                                <Music className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{track.name}</TableCell>
                                    <TableCell>{track.artists.map((artist) => artist.name).join(", ")}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}