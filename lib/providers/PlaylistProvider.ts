// /lib/providers/PlaylistProvider.ts

import { NormalizedPlaylist, Result } from "../types";

export interface PlaylistProvider {
    // Read operations
    getUserPlaylists(): Promise<Result<NormalizedPlaylist[]>>;
}