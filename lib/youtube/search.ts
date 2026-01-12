// lib/youtube/search

interface YouTubeSearchOptions {
    trackName: string;
    trackArtists: string[];
    trackAlbumName?: string;
    prioritizeAudio?: boolean; // default true
}

interface YouTubeSearchResult {
    videoId: string;
    title: string;
    channelTitle: string;
    confidence: number; // 0-1 score
    isAudioOnly: boolean;
}

export async function searchYouTubeForTrack(searchOptions: YouTubeSearchOptions) {
    const query = `"${searchOptions.trackArtists[0]} ${searchOptions.trackName} audio"`;

    // TODO: Call youtube API's using query to search for track
    // TODO: Build helper functions to calculate track similarity
    // TODO: Call this function in spotify-to-youtube.ts
}