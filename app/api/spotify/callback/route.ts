// /api/spotify/callback

import { NextResponse } from "next/server";
import { _exchangeCodeForTokens } from "@/lib/spotify/auth";

const BASE_URL = process.env.BASE_URL;

export async function GET(request: Request) {    
    const { searchParams } = new URL(request.url);

    const error = searchParams.get('error');
    if (error) {
        // Handle error - redirect to error page or return error
        return NextResponse.json({ error: 'Error from Spotify' }, { status: 400 });
    }
    
    const codeURL = searchParams.get('code');
    const stateClient = searchParams.get('state');

    const cookies = request.headers.get('cookie');
    // Parse cookies to extract code_verifier and state
    const codeVerifier = cookies?.split('; ').find(row => row.startsWith('code_verifier='))?.split('=')[1];
    const stateServer = cookies?.split('; ').find(row => row.startsWith('state='))?.split('=')[1];

    if (!codeVerifier || !stateServer) {
        return NextResponse.json({ error: 'Missing code verifier or state from cookies' }, { status: 400 });
    }

    if (stateClient !== stateServer) {
        return NextResponse.json({ error: 'State mismatch between client and server' }, { status: 400 });
    }

    if (!codeURL) {
        return NextResponse.json({ error: 'Missing code from request parameters' }, { status: 400 });
    }

    try {
        const tokens = await _exchangeCodeForTokens(codeURL, codeVerifier);
        const response = NextResponse.redirect(`${BASE_URL}/dashboard`);

        response.cookies.set('access_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Only use secure in production (HTTPS required)
            sameSite: 'lax',
            maxAge: tokens.expires_in,  // Expires when token expires (typically 3600 seconds)
        });

        // Clean up temporary cookies
        response.cookies.delete('code_verifier');
        response.cookies.delete('state');

        return response;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token exchange failed';
        console.error('Token exchange error:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    
}