// /app/api/dev/clear-cookies/spotify/route.ts

import { NextResponse } from "next/server";
import { deleteSpotifyAuthCookies } from "@/lib/cookies/state";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Spotify cookies cleared" });
    deleteSpotifyAuthCookies(response);
    return response;
}