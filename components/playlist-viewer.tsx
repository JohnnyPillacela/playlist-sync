// /components/playlist-viewer.tsx
'use client';

import PlaylistTable from "./playlist-table";
import { NormalizedPlaylist, PlaylistProviderData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import { ListMusic, Loader2, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PlaylistViewerProps {
    providerData: PlaylistProviderData[];
}

async function getYoutubeUserPlaylists(): Promise<NormalizedPlaylist[] | null> {
    try {
        const response = await fetch('/api/youtube/playlists');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error fetching YouTube user playlists:', errorData);
            return null; // Error occurred, return null to indicate failure
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching YouTube user playlists:', error);
        return null; // Network error, return null to indicate failure
    }

}

async function getSpotifyUserPlaylists(): Promise<NormalizedPlaylist[] | null> {
    try {
        const response = await fetch('/api/spotify/playlists');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error fetching Spotify user playlists:', errorData);
            return null; // Error occurred, return null to indicate failure
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Spotify user playlists:', error);
        return null; // Network error, return null to indicate failure
    }
}

export default function PlaylistViewer({providerData}: PlaylistViewerProps) {
    // Build array with authenticated services first (matching GreetUserCard logic)
    const serviceOrder: Array<'spotify' | 'youtube-music'> = [];
    
    // Find provider data
    const spotifyProvider = providerData.find((provider) => provider.service === "spotify");
    const youtubeProvider = providerData.find((provider) => provider.service === "youtube-music");

    const [spotifyError, setSpotifyError] = useState<string | null>(null);
    const [youtubeError, setYoutubeError] = useState<string | null>(null);
    
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

    // NOTE: Manually managing loading/error/data state for multiple endpoints gets complex fast.
    // With SWR, all this code below would be replaced with two simple hooks:
    //   const youtube = useSWR(youtubeProvider?.isAuthenticated ? '/api/youtube/playlists' : null, fetcher);
    //   const spotify = useSWR(spotifyProvider?.isAuthenticated ? '/api/spotify/playlists' : null, fetcher);
    // SWR handles loading, errors, retries, and caching automatically. Consider upgrading when ready.
    useEffect(() => {
        async function fetchPlaylists() {
            if (spotifyProvider?.isAuthenticated) {
                setSpotifyLoading(true);
                setSpotifyError(null);
                
                const playlists = await getSpotifyUserPlaylists();
                
                if (playlists === null) {
                    setSpotifyError('Failed to load Spotify playlists');
                    setSpotifyUserPlaylists([]);
                } else {
                    setSpotifyUserPlaylists(playlists.sort((a, b) => a.name.localeCompare(b.name)));
                }
                
                setSpotifyLoading(false);
            }
            
            if (youtubeProvider?.isAuthenticated) {
                setYoutubeLoading(true);
                setYoutubeError(null);
                
                const playlists = await getYoutubeUserPlaylists();
                
                if (playlists === null) {
                    setYoutubeError('Failed to load YouTube Music playlists');
                    setYoutubeUserPlaylists([]);
                } else {
                    setYoutubeUserPlaylists(playlists.sort((a, b) => a.name.localeCompare(b.name)));
                }
                
                setYoutubeLoading(false);
            }
        }
        fetchPlaylists();
    }, [spotifyProvider?.isAuthenticated, youtubeProvider?.isAuthenticated]);

    const renderProviderSection = (
        service: 'spotify' | 'youtube-music',
        playlists: NormalizedPlaylist[],
        isLoading: boolean,
        error: string | null,
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

        // State 2: Error occurred
        if (error) {
            return (
                <Card key={service} className="shadow-lg w-full">
                    <CardHeader>
                        <CardTitle>Your {providerName} Playlists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia>
                                    <div className="text-red-500">
                                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </EmptyMedia>
                                <EmptyTitle>Failed to load playlists</EmptyTitle>
                                <p className="text-sm text-muted-foreground mt-2">{error}</p>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            );
        }
        
        // State 3: Authenticated but still loading
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

        // State 4: Authenticated with no playlists
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
        
        // State 5: Authenticated with playlists
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
                        service === 'spotify' ? spotifyLoading : youtubeLoading,
                        service === 'spotify' ? spotifyError : youtubeError
                    )}
                </div>
            ))}
        </div>
    )
}