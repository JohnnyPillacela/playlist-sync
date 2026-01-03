// /app/api/youtube/callback/route.ts

import { NextResponse } from "next/server";
import { exchangeCodeForYoutubeTokens } from "@/lib/youtube/auth";
import { GOOGLE_ACCESS_TOKEN_KEY, GOOGLE_REFRESH_TOKEN_KEY } from "@/lib/constants/google";

const BASE_URL = process.env.BASE_URL;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const error = searchParams.get('error');

    if (error) {
        // Handle error - redirect to error page or return error
        return NextResponse.json({ error: 'Error from YouTube' }, { status: 400 });

    }

    const code = searchParams.get('code');
    if (!code) {
        return NextResponse.json(
            { error: 'Missing authorization code from request parameters' },
            { status: 400 }
        );
    }

    try {
        const tokens = await exchangeCodeForYoutubeTokens(code);
        const response = NextResponse.redirect(`${BASE_URL}/dashboard`);

        // Detect HTTPS properly
        const requestUrl = new URL(request.url);
        const isHttps =
            requestUrl.protocol === 'https:' ||
            request.headers.get('x-forwarded-proto') === 'https';

        /**
         * NOTE (TEMPORARY):
         * These cookies are used for YouTube API access during development.
         * In the future, these tokens should be persisted in the database
         * (e.g., Supabase) and refreshed server-side per user.
        */

        response.cookies.set(GOOGLE_ACCESS_TOKEN_KEY, tokens.access_token, {
            httpOnly: true,
            secure: isHttps,
            sameSite: 'lax',
            maxAge: tokens.expires_in,
            // path: '/',
        });

        /**
         * IMPORTANT:
         * Google only returns refresh_token on FIRST consent.
         * If it's missing, we must NOT overwrite an existing one.
         * (Later this logic will live in DB persistence.)
        */

        if (tokens.refresh_token) {
            response.cookies.set(GOOGLE_REFRESH_TOKEN_KEY, tokens.refresh_token, {
                httpOnly: true,
                secure: isHttps,
                sameSite: 'lax',
                // Refresh tokens are long-lived; cookie maxAge is optional here
                // path: '/',
            });
        }

        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Youtube token exchange failed';

        console.error('Youtube token exchange error:', error);

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}