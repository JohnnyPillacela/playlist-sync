// /app/api/youtube/auth/route.ts

import { NextResponse } from "next/server";
import { getYoutubeAuthUrl } from "@/lib/youtube/auth";

export async function GET() {
    try {
        const authUrl = getYoutubeAuthUrl();

        // Redirect user to Google OAuth consent screen
        return NextResponse.redirect(authUrl);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to start YouTube OAuth";

        console.error("YouTube auth start error:", error);

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}