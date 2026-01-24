// /lib/transfer/matching.ts

import { SearchProvider, SearchResult } from "../providers/SearchProvider";
import { GEN_ERRORS, Result, NormalizedTrack } from "../types";

export async function findMatchingTrack(
    track: NormalizedTrack,
    searchProvider: SearchProvider,
    options: MatchingOptions = {}
): Promise<Result<MatchingResult>> {
    const { confidenceThreshold = 0.7, prioritizeAudio = true } = options;

    const searchResult = await searchProvider.search({
        trackName: track.name,
        trackArtists: track.artists,
        trackAlbumName: track.album,
        prioritizeAudio,
    });

    if (!searchResult.ok) {
        return { ok: false, error: searchResult.error };
    }

    const result = searchResult.data;

    if (result.confidence >= confidenceThreshold) {
        return {
            ok: true,
            data: { matched: result, reason: undefined }
        };
    }

    return {
        ok: true,
        data: {
            matched: result, // TODO: hardcode this for now, but we should return empty later
            reason: GEN_ERRORS.LOW_CONFIDENCE
        }
    };
}

export interface MatchingOptions {
    confidenceThreshold?: number; // default 0.7
    prioritizeAudio?: boolean;     // default true
}

export interface MatchingResult {
    matched: SearchResult | null;
    reason?: typeof GEN_ERRORS.LOW_CONFIDENCE | typeof GEN_ERRORS.NOT_FOUND;
}