// /api/spotify/user

import { _getCurrentUserProfile } from "@/lib/spotify/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const currentUser = await _getCurrentUserProfile(); // Reads access token from cookies automatically
        if (!currentUser.ok) {
            return NextResponse.json({ error: currentUser.error }, { status: 401 });
        }
        return NextResponse.json(currentUser.data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in /api/spotify/user:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}
