// /api/spotify/auth

import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        'grant_type': 'client_credentials'
    },
    json: true
};

const _fetchTokenDetails = async (authOptions: any) => {
    const response = await fetch(authOptions.url, {
        method: 'POST',
        headers: authOptions.headers,
        body: new URLSearchParams(authOptions.body).toString(),
    });
    const data = await response.json();
    return data;
}

export async function GET() {
    const tokenDetails = await _fetchTokenDetails(authOptions);
    return NextResponse.json(tokenDetails);
}
