// lib/youtube/search

import { GEN_ERRORS, Result, SDK_ERRORS } from "../types";
import { getYoutubeSDK } from "./sdk";

interface YouTubeSearchOptions {
    trackName: string;
    trackArtists: string[];
    trackAlbumName?: string;
    prioritizeAudio?: boolean; // default true
}

export interface YouTubeSearchResult {
    videoId: string;
    title: string;
    channelTitle: string;
    confidence: number; // 0-1 score
    searchDuration: number; // milliseconds
}

export async function searchYouTubeForTrack(searchOptions: YouTubeSearchOptions): Promise<Result<YouTubeSearchResult>> {
    const startTime = Date.now();
    const youtubeSDKResult = await getYoutubeSDK();

    if (!youtubeSDKResult.ok) {
        return {
            ok: false,
            error: SDK_ERRORS.YOUTUBE_SDK_NOT_INITIALIZED
        }
    }

    const youtubeSDK = youtubeSDKResult.data;
    const searchQuery = buildSearchQuery(searchOptions);

    try {
        const searchResponse = await youtubeSDK.search.list({
            part: ['snippet'],
            q: searchQuery,
            type: ['video'],
            maxResults: 1,
        });
    
        // 3. Handle Error Response
        if (!searchResponse.data?.items) {
            return { 
                ok: false, 
                error: SDK_ERRORS.YOUTUBE_API_ERROR
            };
        }
    
        if (searchResponse.data.items.length === 0) {
            return {
                ok: false,
                error: GEN_ERRORS.NO_RESULTS
            }
        }
    
        // 4. Score search results
        const searchResults: YouTubeSearchResult[] = searchResponse.data.items.map((item) => ({
            videoId: item.id?.videoId || '',
            title: item.snippet?.title || '',
            channelTitle: item.snippet?.channelTitle || '',
            confidence: 0.8, // TODO: Build helper functions to calculate track similarity
            searchDuration: Date.now() - startTime,
        }));
    
        // 5. Return best match
        const sorted = searchResults.sort((a, b) => b.confidence - a.confidence);
        const bestMatch: YouTubeSearchResult = sorted[0];
    
        return {
            ok: true,
            data: bestMatch
        };
    } catch (error: any) {
        // Handle quota exceeded error
        if (error?.code === 403 && error?.message?.includes('quota')) {
            console.error('❌ YouTube API quota exceeded!');
            return {
                ok: false,
                error: SDK_ERRORS.YOUTUBE_QUOTA_EXCEEDED
            };
        }
        
        console.error('YouTube API error:', error);
        return {
            ok: false,
            error: SDK_ERRORS.YOUTUBE_API_ERROR
        };
    }

}

/**
 * Builds an optimized search query for YouTube from track information.
 * Strategy: Use artist and track name, add "audio" keyword for better music results
 */
function buildSearchQuery(searchOptions: YouTubeSearchOptions): string {
    const { trackName, trackArtists, prioritizeAudio = true } = searchOptions;
    
    // Clean track name: remove common suffixes that might hurt search
    const cleanedTrackName = cleanTrackName(trackName);
    
    // Use primary artist (first in array) for main query
    const primaryArtist = trackArtists[0] || '';
    
    // Build base query with artist and track
    let query = `${primaryArtist} ${cleanedTrackName}`;
    
    // Add "audio" or "official audio" to prioritize music over other content
    if (prioritizeAudio) {
        query += ' audio';
    }
    
    return query;
}

/**
 * Basic cleanup of track name for V1.
 * Just normalizes whitespace - keeps all metadata, numbers, symbols intact.
 * Can be enhanced later based on actual search results.
 */
function cleanTrackName(trackName: string): string {
    // Normalize multiple spaces to single space and trim
    return trackName.replace(/\s+/g, ' ').trim();
}