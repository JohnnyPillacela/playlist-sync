// /api/spotify/playlists
import { NextResponse } from "next/server";
import { _fetchTokenDetails } from "@/lib/spotify/auth";
import { Song } from "@/lib/constants/song";
import { _fetchPlaylistTracks } from "@/lib/spotify/playlists";

const tokenDetails = await _fetchTokenDetails();
const worshipHimPlaylistID = "6Qrp1OAdtxJomUi1RyhyPr"

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