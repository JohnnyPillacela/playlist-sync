// /app/test/page.tsx

import { transfer } from "@/lib/transfer/spotify-to-youtube";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TestPage() {
    const testResult = await transfer({
        spotifyPlaylistId: "5Iavgt4CvEYZ2tJXfyqNPw",
        playlistName: "Love"
    });

    if (!testResult.ok) {
        return (
            <div className="container mx-auto p-8">
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle>Test Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">{testResult.error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { data } = testResult;
    const tracks = data.matchedTracks;
    const cachedCount = tracks.filter(t => t.cameFromCache).length;
    const totalCount = tracks.length;
    const hitRate = totalCount > 0 ? Math.round((cachedCount / totalCount) * 100) : 0;

    return (
        <div className="container mx-auto p-8 space-y-6">
            <h1 className="text-3xl font-bold">Transfer Test Results</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Tracks</CardDescription>
                        <CardTitle className="text-3xl">{data.tracksTotal}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Matched</CardDescription>
                        <CardTitle className="text-3xl text-green-600">{data.tracksMatched}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Cache Hit Rate</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">{hitRate}%</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Duration</CardDescription>
                        <CardTitle className="text-3xl">{(data.duration / 1000).toFixed(2)}s</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Cache Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Cache Statistics</CardTitle>
                    <CardDescription>
                        {cachedCount} of {totalCount} results retrieved from cache
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-500 text-white">Cached</Badge>
                            <span>{cachedCount} tracks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Fresh API</Badge>
                            <span>{totalCount - cachedCount} tracks</span>
                        </div>
                    </div>
                    
                    {/* Global Cache Stats */}
                    {data.cacheStats && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2 text-sm">Global Cache Performance</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                <div>
                                    <div className="text-gray-500">Cache Size</div>
                                    <div className="font-medium">{data.cacheStats.size} / {data.cacheStats.maxSize}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Usage</div>
                                    <div className="font-medium">{data.cacheStats.usagePercent.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Hit Rate</div>
                                    <div className="font-medium text-green-600">{data.cacheStats.hitRate.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Total Hits</div>
                                    <div className="font-medium text-blue-600">{data.cacheStats.hits}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Total Misses</div>
                                    <div className="font-medium text-orange-600">{data.cacheStats.misses}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Matched Tracks */}
            <Card>
                <CardHeader>
                    <CardTitle>Matched Tracks</CardTitle>
                    <CardDescription>{tracks.length} tracks matched on YouTube</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {tracks.map((track, idx) => (
                            <div
                                key={track.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">{track.title}</div>
                                    <div className="text-sm text-gray-500">{track.channelTitle}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">
                                        {track.searchDuration}ms
                                    </span>
                                    <Badge 
                                        variant={track.cameFromCache ? "secondary" : "outline"}
                                        className={track.cameFromCache ? "bg-blue-500 text-white" : ""}
                                    >
                                        {track.cameFromCache ? "Cached" : "Fresh"}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                        {Math.round(track.confidence * 100)}% confidence
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Unmatched Tracks */}
            {data.unmatchedTracks.length > 0 && (
                <Card className="border-yellow-500">
                    <CardHeader>
                        <CardTitle>Unmatched Tracks</CardTitle>
                        <CardDescription>{data.unmatchedTracks.length} tracks could not be matched</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.unmatchedTracks.map((track, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                                >
                                    <div>
                                        <div className="font-medium">{track.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {track.artists.join(", ")}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-yellow-700 border-yellow-700">
                                        {track.reason}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

