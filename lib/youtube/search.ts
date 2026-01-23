// lib/youtube/search

import { Result } from "../types";
import { YoutubeSearchProviderImpl } from "../providers/youtube/YoutubeSearchProviderImpl";
import { SearchOptions, SearchResult } from "../providers/SearchProvider";


export async function searchYouTubeForTrack(searchOptions: SearchOptions): Promise<Result<SearchResult>> {

    const youtubeSearchProvider = new YoutubeSearchProviderImpl();
    const youtubeSearchResult = await youtubeSearchProvider.search(searchOptions);

    return youtubeSearchResult;
}
