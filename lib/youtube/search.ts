// lib/youtube/search

import { buildKnowledgeCacheKey } from "../cache/keyBuilder";
import { GEN_ERRORS, Result, SDK_ERRORS } from "../types";
import { handleYouTubeAPIError } from "./errorHandler";
import { getYoutubeSDK } from "./sdk";
import { youtubeCache } from "./cache";
import { YOUTUBE } from "../cache/constants";

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
    cameFromCache: boolean; // whether this result came from cache
}

export async function searchYouTubeForTrack(searchOptions: YouTubeSearchOptions): Promise<Result<YouTubeSearchResult>> {
    const startTime = Date.now();
    const canonical = buildCanonicalTrackQuery(searchOptions.trackName, searchOptions.trackArtists);
    const cacheKey = buildKnowledgeCacheKey(YOUTUBE.SEARCH_NAMESPACE, [canonical.artist, canonical.title]);
    const searchQuery = buildSearchQueryFromCanonical(canonical, searchOptions.prioritizeAudio);

    const cachedResult = youtubeCache.search.get(cacheKey);

    if (cachedResult) {
        console.log('✅ CACHE HIT for query:', searchQuery);
        const stats = youtubeCache.search.getStats();
        console.log('📊 Cache stats:', stats);
        return {
            ok: true,
            data: {
                ...cachedResult,
                searchDuration: Date.now() - startTime,
                cameFromCache: true,
            }
        };
    }

    console.log('❌ CACHE MISS - Making YouTube API call for:', searchQuery);

    const youtubeSDKResult = await getYoutubeSDK();

    if (!youtubeSDKResult.ok) {
        return { ok: false, error: SDK_ERRORS.YOUTUBE_SDK_NOT_INITIALIZED };
    }

    const youtubeSDK = youtubeSDKResult.data;

    // Call YouTube API (only wrap the API call)
    let searchResponse;
    try {
        searchResponse = await youtubeSDK.search.list({
            part: ['snippet'],
            q: searchQuery,
            type: ['video'],
            maxResults: 1,
        });
    } catch (error: any) {
        return handleYouTubeAPIError(error);
    }

    // Validate response
    if (!searchResponse.data?.items) {
        return { ok: false, error: SDK_ERRORS.YOUTUBE_API_ERROR };
    }

    if (searchResponse.data.items.length === 0) {
        return { ok: false, error: GEN_ERRORS.NO_RESULTS };
    }

    // Map results to our format
    const searchResults: YouTubeSearchResult[] = searchResponse.data.items.map((item) => ({
        videoId: item.id?.videoId || '',
        title: item.snippet?.title || '',
        channelTitle: item.snippet?.channelTitle || '',
        confidence: 0.8, // TODO: Build helper functions to calculate track similarity
        searchDuration: Date.now() - startTime,
        cameFromCache: false,
    }));

    // Return best match (sorted by confidence)
    const sorted = searchResults.sort((a, b) => b.confidence - a.confidence);

    // Cache the result
    youtubeCache.search.set(cacheKey, sorted[0]);

    return { ok: true, data: sorted[0] };
}



// -------------------------
// Canonical normalization
// -------------------------

interface CanonicalTrackQuery {
    artist: string;
    title: string;
}

function normalizeArtist(artist: string): string {
    return artist
        .toLowerCase()
        .replace(/feat\.|ft\.|featuring|x|&/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/\(.*?\)|\[.*?\]/g, '') // remove remix/remaster/live
        .replace(/-.*$/g, '')            // remove dash suffixes
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildCanonicalTrackQuery(
    trackName: string,
    artists: string[]
): CanonicalTrackQuery {
    const canonicalTrackQuery: CanonicalTrackQuery = {
        artist: normalizeArtist(artists[0] || ''),
        title: normalizeTitle(trackName),
    };
    return canonicalTrackQuery;
}

function buildSearchQueryFromCanonical(
    canonical: CanonicalTrackQuery,
    prioritizeAudio: boolean = true
): string {
    let query = `${canonical.artist} ${canonical.title}`;

    if (prioritizeAudio) {
        query += ' audio';
    }

    return query;
}