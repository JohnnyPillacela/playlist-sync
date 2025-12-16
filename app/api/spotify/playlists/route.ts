// /api/spotify/playlists
import { NextRequest, NextResponse } from "next/server";
import { _fetchTokenDetails } from "../auth/route";
import { Song } from "@/lib/constants/song";

const tokenDetails = await _fetchTokenDetails();
const worshipHimPlaylistID = "6Qrp1OAdtxJomUi1RyhyPr"

const _fetchPlaylistTracks = async (playlistID: string, accessToken: string) => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
}

export async function GET(request: NextRequest) {
    const playlistTracks = await _fetchPlaylistTracks(worshipHimPlaylistID, tokenDetails.access_token);
    const playlistTrackItems = playlistTracks.tracks.items;
    const songs: Song[] = [];
    playlistTrackItems.forEach((item: any) => {
        const trackName = item.track.name;
        const trackArtists: string[] = item.track.artists.map((artist: any) => artist.name);
        const currentSong: Song = {
            name: trackName,
            artists: trackArtists,
        }
        songs.push(currentSong);
    })
    return NextResponse.json(songs);
}