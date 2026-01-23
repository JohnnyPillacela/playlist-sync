// /lib/providers/youtube/YoutubeSearchProviderImpl.ts

import { GEN_ERRORS, Result, SDK_ERRORS } from "@/lib/types";
import { buildCanonicalTrackQuery, buildSearchQueryFromCanonical, SearchOptions, SearchProvider, SearchResult } from "../SearchProvider";
import { CACHE_MESSAGES, PROVIDER_CALLERS, YOUTUBE, YOUTUBE_SEARCH_TTL_SECONDS } from "@/lib/cache/constants";
import { buildKnowledgeCacheKey } from "@/lib/cache/keyBuilder";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { youtubeCache } from "@/lib/youtube/cache";
import { getYoutubeSDK } from "@/lib/youtube/sdk";
import { handleYouTubeAPIError } from "@/lib/youtube/errorHandler";

export class YoutubeSearchProviderImpl implements SearchProvider {
    async search(searchOptions: SearchOptions): Promise<Result<SearchResult>> {
        const startTime = Date.now();
        const canonical = buildCanonicalTrackQuery(searchOptions.trackName, searchOptions.trackArtists);
        const cacheKey = buildKnowledgeCacheKey(YOUTUBE.SEARCH_NAMESPACE, [canonical.artist, canonical.title]);
        const searchQuery = buildSearchQueryFromCanonical(canonical, searchOptions.prioritizeAudio);
    
        // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
        const cachedResult = await getFromCaches<SearchResult>(cacheKey, PROVIDER_CALLERS.YOUTUBE_SEARCH, youtubeCache.search);
        if (cachedResult) {
            return { 
                ok: true, 
                data: {
                    ...cachedResult,
                    cameFromCache: true,
                    searchDuration: Date.now() - startTime,
                } 
            }
        }
    
        console.log(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} ${CACHE_MESSAGES.FETCHING_FROM_API}`);
    
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
        const searchResults: SearchResult[] = searchResponse.data.items.map((item) => ({
            id: item.id?.videoId || '',
            title: item.snippet?.title || '',
            artists: item.snippet?.channelTitle ? [item.snippet?.channelTitle] : [],
            channelTitle: item.snippet?.channelTitle || '',
            confidence: 0.8, // TODO: Build helper functions to calculate track similarity
            thumbnailUrl: item.snippet?.thumbnails?.default?.url || '',
            // albumName: item.snippet?.albumTitle,
            searchDuration: Date.now() - startTime,
            cameFromCache: false,
        }));
    
        // Return best match (sorted by confidence)
        const sorted = searchResults.sort((a, b) => b.confidence - a.confidence);
    
        // Set in caches before returning
        await setCaches(cacheKey, PROVIDER_CALLERS.YOUTUBE_SEARCH, youtubeCache.search, sorted[0], YOUTUBE_SEARCH_TTL_SECONDS);
    
        console.log(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} Cached ${sorted[0]}`);
    
        return { ok: true, data: sorted[0] };
    }
}