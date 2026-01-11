// lib/youtube/search

interface YouTubeSearchOptions {
    trackName: string;
    artistNames: string[];
    albumName?: string;
    prioritizeAudio?: boolean; // default true
}

interface YouTubeSearchResult {
    videoId: string;
    title: string;
    channelTitle: string;
    confidence: number; // 0-1 score
    isAudioOnly: boolean;
}

export async function searchYouTubeForTrack({ trackName, artistNames, albumName, prioritizeAudio }: YouTubeSearchOptions) {
    const query = `"${artistNames[0]} ${trackName} audio"`;

    // TODO: Call youtube API's using query to search for track
    // TODO: Build helper functions to calculate track similarity
    // TODO: Call this function in spotify-to-youtube.ts
}