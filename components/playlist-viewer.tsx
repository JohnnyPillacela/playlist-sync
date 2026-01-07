// /components/playlist-viewer.tsx
'use client';

import PlaylistTable from "./playlist-table";
import { NormalizedPlaylist, PlaylistProviderData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import { ListMusic, Loader2, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { normalizedYoutubePlaylist } from "@/lib/youtube/playlists";
import { useEffect, useState } from "react";

interface PlaylistViewerProps {
    providerData: PlaylistProviderData[];
}

async function getYoutubeUserPlaylists() {
    const response = await fetch('/api/youtube/playlists');
    if (!response.ok) {
        return { error: 'Failed to fetch YouTube user playlists' };
    }
    return response.json();
}

async function getSpotifyUserPlaylists() {
    const response = await fetch('/api/spotify/playlists');
    if (!response.ok) {
        return { error: 'Failed to fetch Spotify user playlists' };
    }
    return response.json();
}

export default function PlaylistViewer({providerData}: PlaylistViewerProps) {
    // Build array with authenticated services first (matching GreetUserCard logic)
    const serviceOrder: Array<'spotify' | 'youtube-music'> = [];
    
    // Find provider data
    const spotifyProvider = providerData.find((provider) => provider.service === "spotify");
    const youtubeProvider = providerData.find((provider) => provider.service === "youtube-music");
    
    // Add authenticated services first
    if (spotifyProvider?.isAuthenticated) serviceOrder.push('spotify');
    if (youtubeProvider?.isAuthenticated) serviceOrder.push('youtube-music');
    
    // Add unauthenticated services
    if (!spotifyProvider?.isAuthenticated) serviceOrder.push('spotify');
    if (!youtubeProvider?.isAuthenticated) serviceOrder.push('youtube-music');

    const [spotifyUserPlaylists, setSpotifyUserPlaylists] = useState<NormalizedPlaylist[]>([]);
    const [youtubeUserPlaylists, setYoutubeUserPlaylists] = useState<NormalizedPlaylist[]>([]);

    const [spotifyLoading, setSpotifyLoading] = useState(false);
    const [youtubeLoading, setYoutubeLoading] = useState(false);

    useEffect(() => {
        if (spotifyProvider?.isAuthenticated) {
            setSpotifyLoading(true);
            getSpotifyUserPlaylists()
                .then(setSpotifyUserPlaylists)
                .finally(() => setSpotifyLoading(false));
        }
        
        if (youtubeProvider?.isAuthenticated) {
            setYoutubeLoading(true);
            getYoutubeUserPlaylists()
                .then(setYoutubeUserPlaylists)
                .finally(() => setYoutubeLoading(false));
        }
    }, [spotifyProvider?.isAuthenticated, youtubeProvider?.isAuthenticated]);

    const renderProviderSection = (
        service: 'spotify' | 'youtube-music',
        playlists: NormalizedPlaylist[],
        isLoading: boolean,
    ) => {
        const provider = service === 'spotify' ? spotifyProvider : youtubeProvider;
        const providerName = service === 'spotify' ? 'Spotify' : 'YouTube Music';
        const authUrl = service === 'spotify' ? '/api/spotify/auth' : '/api/youtube/auth';
        
        // State 1: Not authenticated
        if (!provider?.isAuthenticated) {
            return (
                <Card key={service} className="shadow-lg w-full">
                    <CardHeader>
                        <CardTitle>Your {providerName} Playlists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia>
                                    <LogIn className="w-16 h-16" />
                                </EmptyMedia>
                                <EmptyTitle>Please sign in to view your {providerName} playlists</EmptyTitle>
                            </EmptyHeader>
                            <Link href={authUrl}>
                                <Button>Sign in to {providerName}</Button>
                            </Link>
                        </Empty>
                    </CardContent>
                </Card>
            );
        }
        
        // State 2: Authenticated but still loading
        if (isLoading) {
            return (
                <Card key={service} className="shadow-lg w-full">
                    <CardHeader>
                        <CardTitle>Your {providerName} Playlists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Loading spinner or skeleton */}
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // State 3: Authenticated with no playlists
        if (playlists.length === 0) {
            return (
                <Card key={service} className="shadow-lg w-full">
                    <CardHeader>
                        <CardTitle>Your {providerName} Playlists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia>
                                    <ListMusic className="w-16 h-16" />
                                </EmptyMedia>
                                <EmptyTitle>You have no playlists on {providerName}</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            );
        }
        
        // State 4: Authenticated with playlists
        return (
            <PlaylistTable 
                key={service}
                playlists={playlists} 
                provider={service} 
            />
        );
    };

    return (
        <div className="w-3/4 mx-auto mt-4 flex flex-row gap-4">
            {serviceOrder.map(service => (
                <div key={service} className="flex-1 min-w-0">
                    {renderProviderSection(
                        service,
                        service === 'spotify' ? spotifyUserPlaylists : youtubeUserPlaylists,
                        service === 'spotify' ? spotifyLoading : youtubeLoading
                    )}
                </div>
            ))}
        </div>
    )
}