// /components/GreetUserCard.tsx
"use client";

import { SpotifyUser } from "@/lib/constants/spotify";
import { GoogleUserInfo } from "@/lib/constants/google";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ServiceUserInfo from "@/components/service-user-info";

interface GreetUserCardProps {
    spotifyUser: SpotifyUser | null;
    googleUser: GoogleUserInfo | null;
    playlists: number;
}

export default function GreetUserCard({ spotifyUser, googleUser, playlists }: GreetUserCardProps) {
    const router = useRouter();

    const handleClearCookies = async () => {
        try {
            const response = await fetch('/api/dev/clear-cookies', {
                method: 'POST',
            });
            
            if (response.ok) {
                // Redirect to home page after clearing cookies
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to clear cookies:', error);
        }
    }; 

    const handleClearSpotifyCookies = async () => {
        try {
            const response = await fetch('/api/dev/clear-cookies/spotify', {
                method: 'POST',
            });

            if (response.ok) {
                // Refresh the page after clearing cookies
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to clear Spotify cookies:', error);
        }
    };

    const handleClearGoogleCookies = async () => {
        try {
            const response = await fetch('/api/dev/clear-cookies/google', {
                method: 'POST',
            });

            if (response.ok) {
                // Refresh the page after clearing cookies
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to clear Google cookies:', error);
        }
    };

    // Build array with authenticated services first
    const serviceOrder: Array<'spotify' | 'youtube-music'> = [];

    // Add authenticated services first
    if (spotifyUser) serviceOrder.push('spotify');
    if (googleUser) serviceOrder.push('youtube-music');

    // Add unauthenticated services
    if (!spotifyUser) serviceOrder.push('spotify');
    if (!googleUser) serviceOrder.push('youtube-music');

    const renderServiceCard = (service: 'spotify' | 'youtube-music') => {
        if (service === 'spotify') {
            return (
                <ServiceUserInfo
                    key="spotify"
                    service="spotify"
                    serviceName="Spotify"
                    userData={spotifyUser}
                    authUrl="/api/spotify/auth"
                    onLogout={handleClearSpotifyCookies}
                    extraFields={[
                        { label: "Playlists", value: playlists },
                        {
                            label: "Subscription",
                            value: spotifyUser?.product === "premium" ? "Premium" : "Free",
                        },
                    ]}
                />
            )
        } else {
            return (
                <ServiceUserInfo
                    key="youtube-music"
                    service="youtube-music"
                    serviceName="YouTube Music"
                    userData={googleUser}
                    authUrl="/api/youtube/auth"
                    onLogout={handleClearGoogleCookies}
                />
            );
        }
    };

    return (
        <Card>
        <CardHeader>
            <CardTitle className="text-5xl font-bold">Playlist Sync Dashboard!</CardTitle>
            <CardDescription className="text-3xl mt-2">
                Sync your playlists between connected services
            </CardDescription>
            <div className="mt-4 flex gap-3">
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
                <Button variant="destructive" onClick={handleClearCookies}>
                    Log out of all services
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {/* 2-Column Service Status Layout */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6">
                {serviceOrder.map(service => renderServiceCard(service))}
            </div>
        </CardContent>
    </Card>
    )
}