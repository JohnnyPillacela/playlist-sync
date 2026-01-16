// lib/youtube/errorHandler.ts

import { Result, SDK_ERRORS } from "../types";

/**
 * Handles YouTube API errors and returns appropriate Result
 */
export function handleYouTubeAPIError<T>(error: any): Result<T> {
    if (error?.code === 403 && error?.message?.includes('quota')) {
        console.error('❌ YouTube API quota exceeded!');
        return { 
            ok: false, 
            error: SDK_ERRORS.YOUTUBE_QUOTA_EXCEEDED
        };
    }

    // Check for rate limit (429)
    if (error?.code === 429) {
        console.error('❌ YouTube API rate limit hit!');
        return { 
            ok: false, 
            error: SDK_ERRORS.YOUTUBE_RATE_LIMIT
        };
    }

    // Generic API Error
    console.error('❌ YouTube API error:', error);
    return { 
        ok: false, 
        error: error.message 
    };
}

