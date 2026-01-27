// /lib/providers/PlaylistProvider.ts

import { NormalizedPlaylist, Result } from "../types";

export interface PlaylistProvider {
    // Read operations
    getUserPlaylists(): Promise<Result<NormalizedPlaylist[]>>;

    // Write operations
    createPlaylist(
        name: string,
        description?: string,
    ): Promise<Result<PlaylistCreationResult>>;

    addTracksToPlaylist(
        playlistId: string,
        trackIdsAndNames: TrackIdAndNameMapping[],
    ): Promise<Result<AddTracksResult>>;

    getPlaylist(
        playlistId: string,
    ): Promise<Result<NormalizedPlaylist | null>>;
}

export interface PlaylistCreationResult {
    id: string;
    url: string;
    operation: 'created' | 'updated';
}

export interface AddTracksResult {
    addedCount: number;
    failed: Array<{
        trackId: string;
        trackName: string;
        error: string;
    }>;
}

export type TrackIdAndNameMapping = {
    trackId: string;
    trackName: string;
}

/**
 * Sanitizes playlist name for YouTube API compatibility
 * Replaces problematic characters like "<" which can cause API errors
 */
export function sanitizePlaylistName(name: string): string {
    if (!name || name.trim().length === 0) {
        return 'Untitled Playlist';
    }

    // Replace common emoji-like patterns
    let sanitized = name
        .replace(/<3/g, '❤️')  // Replace <3 with heart emoji
        .replace(/</g, '&lt;')  // Escape remaining < characters
        .replace(/>/g, '&gt;')  // Escape > characters for consistency
        .trim();

    // Ensure name is not empty after sanitization
    if (sanitized.length === 0) {
        return 'Untitled Playlist';
    }

    // YouTube has a max length of 150 characters for playlist titles
    if (sanitized.length > 150) {
        sanitized = sanitized.substring(0, 147) + '...';
    }

    return sanitized;
}