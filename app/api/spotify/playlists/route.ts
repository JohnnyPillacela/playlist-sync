// /api/spotify/playlists
import { NextRequest } from "next/server";


export function GET(request: NextRequest) {
    return new Response('Hello, world!');
}