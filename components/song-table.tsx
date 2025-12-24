// /components/song-table.tsx

import { Track } from "@spotify/web-api-ts-sdk";

export function SongTable({ songs }: { songs: Track[] }) {
    return (
        <div>
            <h1>Song Table</h1>
        </div>
    )
}