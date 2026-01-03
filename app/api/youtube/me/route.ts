// /app/api/youtube/me/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type GoogleUserInfo = {
    id: string;
    email: string;
    verified_email: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    locale?: string;
};

export async function GET() {
    const cookieStore = await cookies();
    const youtubeAccessToken = cookieStore.get("youtube_access_token");

    if (!youtubeAccessToken) {
        return NextResponse.json(
            { error: "Not authenticated with Google" },
            { status: 401 }
        );
    }

    const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
            headers: {
                Authorization: `Bearer ${youtubeAccessToken.value}`,
            },
            // Prevent accidental caching during dev
            cache: "no-store",
        }
    );

    if (!response.ok) {
        const text = await response.text();
        console.error("Google userinfo error:", text);

        return NextResponse.json(
            { error: "Failed to fetch Google user info" },
            { status: 500 }
        );
    }

    const data: GoogleUserInfo = await response.json();

    return NextResponse.json({
        email: data.email,
        verified: data.verified_email,
        name: data.name,
        picture: data.picture,
        locale: data.locale,
    });
}