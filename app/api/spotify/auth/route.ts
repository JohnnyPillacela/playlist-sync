// /api/spotify/auth

import { NextResponse } from "next/server";
import { generateSpotifyAuthUrl } from "@/lib/spotify/server-pkce";

export async function GET() {
    try {
        const authUrlResult = await generateSpotifyAuthUrl();
        if (!authUrlResult.ok) {
            return NextResponse.json({ error: authUrlResult.error }, { status: 401 });
        }

        const authUrl = authUrlResult.data;
        return NextResponse.redirect(authUrl);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in /api/spotify/auth:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}
