// /components/GreetUserCard.tsx
"use client";

import { SpotifyUser } from "@/lib/constants/spotify";
import { GoogleUserInfo } from "@/lib/constants/google";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
            {/* 2-Column Service Status Layout */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6">
                {/* Spotify Card */}
                <div className="flex flex-col gap-1 p-4 border rounded-lg bg-card">
                    <h3 className="text-lg font-semibold">Spotify</h3>
                    {spotifyUser ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Email</span>
                                <span className="text-base">{spotifyUser.email}</span>
                            </div>
                            {spotifyUser.country && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Country</span>
                                    <span className="text-base">{spotifyUser.country}</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Subscription</span>
                                <span className="text-base font-medium">
                                    {spotifyUser.product === 'premium' ? 'Premium' : 'Free'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Playlists</span>
                                <span className="text-base font-medium">
                                    {playlists}
                                </span>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-fit mt-1 self-end text-xs px-2 py-1 h-7"
                                onClick={handleClearSpotifyCookies}
                            >
                                Log out of Spotify
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                            {/* TODO: Update Spotify api route auth link */}
                            <Link href="/">
                                <Button variant="outline" size="sm" className="w-full">
                                    Sign in to Spotify
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Google/YouTube Card */}
                <div className="flex flex-col gap-1 p-4 border rounded-lg bg-card">
                    <h3 className="text-lg font-semibold">Google (YouTube Music)</h3>
                    {googleUser ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Email</span>
                                <span className="text-base">{googleUser.email}</span>
                            </div>
                            {googleUser.name && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <span className="text-base">{googleUser.name}</span>
                                </div>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-fit mt-1 self-end text-xs px-2 py-1 h-7"
                                onClick={handleClearGoogleCookies}
                            >
                                Log out of Google
                            </Button>

                        </>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                            <Link href="/api/youtube/auth?redirect=/dashboard">
                                <Button variant="outline" size="sm" className="w-full">
                                    Sign in to Google
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">More card content coming soon!</span>
                    <span className="text-sm text-muted-foreground mt-1">More features and improvements to come...</span>
                </div>
            </div>
        </CardContent>
    </Card>
    )
}