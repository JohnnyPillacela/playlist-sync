// /lib/providers/youtube/YoutubeSearchProviderImpl.ts

import { GEN_ERRORS, Result, SDK_ERRORS } from "@/lib/types";
import { buildCanonicalTrackQuery, buildSearchQueryFromCanonical, SearchOptions, SearchProvider, SearchResult } from "../SearchProvider";
import { CACHE_MESSAGES, PROVIDER_CALLERS, YOUTUBE, YOUTUBE_SEARCH_TTL_SECONDS } from "@/lib/cache/constants";
import { buildKnowledgeCacheKey } from "@/lib/cache/keyBuilder";
import { getFromCaches, setCaches } from "@/lib/cache/layers";
import { youtubeCache } from "@/lib/youtube/cache";
import { getYoutubeSDK } from "@/lib/youtube/sdk";
import { handleYouTubeAPIError } from "@/lib/youtube/errorHandler";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import { getYTMusicClient } from "@/lib/youtube/ytmusic/client";
import { SongDetailed } from "ytmusic-api";

export class YoutubeSearchProviderImpl implements SearchProvider {
    private sdk: youtube_v3.Youtube | null = null;

    async search(searchOptions: SearchOptions): Promise<Result<SearchResult>> {
        const startTime = Date.now();
        const canonical = buildCanonicalTrackQuery(searchOptions.trackName, searchOptions.trackArtists);
        const cacheKey = buildKnowledgeCacheKey(YOUTUBE.SEARCH_NAMESPACE, [canonical.artist, canonical.title]);
        const searchQuery = buildSearchQueryFromCanonical(canonical, searchOptions.prioritizeAudio);
    
        // Check LRU and Redis caches - returns from either LRU or Redis if found or null if not found
        const cachedResult = await getFromCaches<SearchResult>(cacheKey, PROVIDER_CALLERS.YOUTUBE_SEARCH, youtubeCache.search);
        if (cachedResult) {
            console.log(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} Found in cache: ${cachedResult.title} by ${cachedResult.artists.join(', ')}`);
            return { 
                ok: true, 
                data: {
                    ...cachedResult,
                    cameFromCache: true,
                    searchDuration: Date.now() - startTime,
                } 
            }
        }

        // ========================================
        // Try YTMusic scraper first (quota-free)
        // ========================================
        try {
            const ytMusicClient = await getYTMusicClient();
            const scraperResults = await ytMusicClient.searchSongs(searchQuery);
            
            if (scraperResults.length > 0) {
                const searchResult = this.mapSongDetailedToSearchResult(
                    scraperResults[0]
                );
                
                // Cache the scraper result (same cache as API results)
                await setCaches(
                    cacheKey,
                    PROVIDER_CALLERS.YOUTUBE_SEARCH,
                    youtubeCache.search,
                    searchResult,
                    YOUTUBE_SEARCH_TTL_SECONDS
                );
                
                console.log(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} Found via scraper: ${searchResult.title} by ${searchResult.artists.join(', ')}`);
                return { ok: true, data: searchResult };
            }
            
            console.log(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} Scraper returned no results, falling back to YouTube API`);
        } catch (error: any) {
            console.warn(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} Scraper failed (${error.message}), falling back to YouTube API`);
        };
    
        console.log(`${PROVIDER_CALLERS.YOUTUBE_SEARCH} ${CACHE_MESSAGES.FETCHING_FROM_API}`);
    
        const youtubeSDKResult = await this.getSDK();

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
    
        return { ok: true, data: sorted[0] };
    }

    private async getSDK(): Promise<Result<youtube_v3.Youtube>> {
        if (this.sdk) {
            return { ok: true, data: this.sdk };
        }

        const youtubeSDKResult = await getYoutubeSDK();

        // Cache it if successful
        if (youtubeSDKResult.ok) {
            this.sdk = youtubeSDKResult.data;
        }
        
        return youtubeSDKResult;
    }

    private mapSongDetailedToSearchResult(song: SongDetailed): SearchResult {   
        return {
            id: song.videoId,
            title: song.name,
            artists: [song.artist.name],
            channelTitle: song.artist.name,
            confidence: 0.8,
            thumbnailUrl: song.thumbnails[0].url,
            searchDuration: 0,
            cameFromCache: false,
        }
    }
}