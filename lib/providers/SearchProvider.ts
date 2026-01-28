// /lib/providers/SearchProvider.ts

import { GEN_ERRORS, Result, SDK_ERRORS } from "../types";

export interface SearchProvider {
    search(searchOptions: SearchOptions): Promise<Result<SearchResult>>;
}

export interface SearchResult {
    id: string;
    title: string;
    artists: string[];
    channelTitle: string;
    confidence: number;
    thumbnailUrl: string;
    albumName?: string;
    searchDuration: number;
    cameFromCache: boolean;
}

export interface SearchOptions {
    trackName: string;
    trackArtists: string[];
    trackAlbumName?: string;
    prioritizeAudio?: boolean; // default true
}

export interface UnmatchedTrack {
    name: string;
    artists: string[];
    reason: 
     typeof SDK_ERRORS.YOUTUBE_API_ERROR |
     typeof SDK_ERRORS.SPOTIFY_API_ERROR | 
     typeof GEN_ERRORS.NOT_FOUND |
     typeof GEN_ERRORS.LOW_CONFIDENCE |
     typeof GEN_ERRORS.API_ERROR;
}

export interface CanonicalTrackQuery {
    artist: string;
    title: string;
}

function stripDiacritics(str: string): string {
    // Normalize to NFD (decomposed) form and remove all combining marks
    // so that, e.g., "SANÁME" -> "SANAME" instead of "SANME"/"SNAME".
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


export function normalizeArtist(artist: string): string {
    return stripDiacritics(artist)
        .toLowerCase()
        .replace(/feat\.|ft\.|featuring|&/g, '')
        .replace(/\sx\s/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function normalizeTitle(title: string): string {
    return stripDiacritics(title)
        .toLowerCase()
        .replace(/\(.*?\)|\[.*?\]/g, '') // remove remix/remaster/live
        .replace(/-.*$/g, '')            // remove dash suffixes
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildCanonicalTrackQuery(
    trackName: string,
    artists: string[]
): CanonicalTrackQuery {
    const canonicalTrackQuery: CanonicalTrackQuery = {
        artist: normalizeArtist(artists[0] || ''),
        title: normalizeTitle(trackName),
    };
    return canonicalTrackQuery;
}

export function buildSearchQueryFromCanonical(
    canonical: CanonicalTrackQuery,
    prioritizeAudio: boolean = true
): string {
    let query = `${canonical.artist} ${canonical.title}`;

    if (prioritizeAudio) {
        query += ' audio';
    }

    return query;
}