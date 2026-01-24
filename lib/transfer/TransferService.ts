// /lib/transfer/TransferService.ts

import { CacheStats } from "../cache/cache";
import { SearchResult, UnmatchedTrack } from "../providers/SearchProvider";
import { Result } from "../types";

export interface TransferService {
    transfer(request: TransferRequest): Promise<Result<TransferResponse>>;
}

export interface TransferRequest {
    playlistId: string;
    playlistName: string;
}

export interface TransferResponse {
    success: boolean;
    playlistId?: string;
    playlistUrl?: string;
    tracksTotal: number;
    tracksMatched: number;
    tracksAdded: number;
    matchedTracks: Array<SearchResult>;
    unmatchedTracks: Array<UnmatchedTrack>;
    failedToAdd: Array<{
        videoId: string;
        trackName: string;
        error: string;
    }>
    duration: number // milliseconds
    cacheStats?: CacheStats; // Search cache performance statistics
}



