// /api/spotify/user

import { _getCurrentUser } from "@/lib/spotify/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const currentUser = await _getCurrentUser(); // Reads access token from cookies automatically
        return NextResponse.json(currentUser);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in /api/spotify/user:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}
