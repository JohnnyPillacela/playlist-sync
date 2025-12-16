// /api/spotify/playlists
import { NextRequest, NextResponse } from "next/server";
import { _fetchTokenDetails } from "@/lib/spotify/auth";
import { Song } from "@/lib/constants/song";

const tokenDetails = await _fetchTokenDetails();
const worshipHimPlaylistID = "6Qrp1OAdtxJomUi1RyhyPr"

const _fetchPlaylistTracks = async (playlistID: string, accessToken: string) => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
}

export async function GET() {
    const playlistTracks = await _fetchPlaylistTracks(worshipHimPlaylistID, tokenDetails.access_token);
    const playlistTrackItems = playlistTracks.items;
    const songs: Song[] = [];
    playlistTrackItems.forEach((item: any) => {
        const trackName = item.track.name;
        const trackID = item.track.id;
        const trackAlbumImageUrl = item.track.album.images[0].url;
        const trackArtists: string[] = item.track.artists.map((artist: any) => artist.name);
        const currentSong: Song = {
            id: trackID,
            name: trackName,
            artists: trackArtists,
            trackAlbumImageUrl: trackAlbumImageUrl,
        }
        songs.push(currentSong);
    })
    return NextResponse.json(songs);
}