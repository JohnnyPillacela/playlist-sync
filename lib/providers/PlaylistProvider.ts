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
        trackIds: string[],
    ): Promise<Result<AddTracksResult>>;
}

export interface PlaylistCreationResult {
    id: string;
    url: string;
}

export interface AddTracksResult {
    addedCount: number;
    failed: Array<{
        id: string;
        error: string;
    }>;
}