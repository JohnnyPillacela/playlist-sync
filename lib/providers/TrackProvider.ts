// /lib/providers/TrackProvider.ts

import { NormalizedTrack, Result } from "../types";

export interface TrackProvider {
    getPlaylistTracks(playlistId: string): Promise<Result<NormalizedTrack[]>>;
}