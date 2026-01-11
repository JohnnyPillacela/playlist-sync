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

export async function searchTrack() {

}