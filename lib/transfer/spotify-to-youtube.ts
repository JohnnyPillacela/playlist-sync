// lib/transfer/spotify-to-youtube

import { Result } from "../types";
import { SpotifyTrackProviderImpl } from "../providers/spotify/SpotifyTrackProviderImpl";
import { YoutubeSearchProviderImpl } from "../providers/youtube/YoutubeSearchProviderImpl";
import { YoutubePlaylistProviderImpl } from "../providers/youtube/YoutubePlaylistProviderImpl";
import { SpotifyToYoutubeTransfer } from "./SpotifyToYoutubeTransfer";
import { TransferRequest, TransferResponse } from "./TransferService";

export async function transfer(request: TransferRequest): Promise<Result<TransferResponse>> {
    const transferService = new SpotifyToYoutubeTransfer(
        new SpotifyTrackProviderImpl(),
        new YoutubeSearchProviderImpl(),
        new YoutubePlaylistProviderImpl()
    );

    return transferService.transfer(request);
};