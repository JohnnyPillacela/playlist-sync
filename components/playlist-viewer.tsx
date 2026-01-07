// /components/playlist-viewer.tsx
'use client';

import PlaylistTable from "./playlist-table";
import { PlaylistProviderData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import { ListMusic, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface PlaylistViewerProps {
    providerData: PlaylistProviderData[];
}

export default function PlaylistViewer({ providerData }: PlaylistViewerProps) {
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

    const renderProviderSection = (service: 'spotify' | 'youtube-music') => {
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
        
        // State 2: Authenticated but no playlists
        if (provider.playlists.length === 0) {
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
        
        // State 3: Authenticated with playlists
        return (
            <PlaylistTable 
                key={service}
                playlists={provider.playlists} 
                provider={service} 
            />
        );
    };

    return (
        <div className="w-3/4 mx-auto mt-4 flex flex-row gap-4">
            {serviceOrder.map(service => (
                <div key={service} className="flex-1 min-w-0">
                    {renderProviderSection(service)}
                </div>
            ))}
        </div>
    )
}