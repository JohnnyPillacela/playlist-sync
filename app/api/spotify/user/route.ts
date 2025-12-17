// /api/spotify/user

import { _fetchTokenDetails, _getCurrentUser } from "@/lib/spotify/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessTokenCookie = cookieStore.get('access_token');
        
        const accessToken = accessTokenCookie?.value;
        const currentUser = await _getCurrentUser(accessToken);
        return NextResponse.json(currentUser);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in /api/spotify/auth:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}
