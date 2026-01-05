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

    // Determine the display name from available user data
    const displayName = spotifyUser?.display_name || googleUser?.name || googleUser?.email || "User";

    return (
        <Card>
        <CardHeader>
            <CardTitle className="text-5xl font-bold">Welcome back, {displayName}!</CardTitle>
            <CardDescription className="text-xl mt-2">
                Here's your playlist overview
            </CardDescription>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-base text-muted-foreground">
                {spotifyUser?.email && (
                    <span className="flex items-center">
                        Spotify: {spotifyUser.email}
                    </span>
                )}
                {googleUser?.email && (
                    <>
                        {spotifyUser?.email && <span className="text-border">•</span>}
                        <span>Google: {googleUser.email}</span>
                    </>
                )}
                {spotifyUser?.country && (
                    <>
                        <span className="text-border">•</span>
                        <span>{spotifyUser.country}</span>
                    </>
                )}
            </div>
            <div className="mt-4 flex gap-3">
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
                <Button variant="destructive" onClick={handleClearCookies}>
                    Clear Cookies
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-6">
                {spotifyUser && (
                    <>
                        <div className="flex flex-col">
                            <span className="text-3xl font-semibold">{spotifyUser.product === 'premium' ? 'Premium' : 'Free'}</span>
                            <span className="text-sm text-muted-foreground mt-1">Subscription Status</span>
                        </div> 
                        <div className="h-12 w-px bg-border"></div>
                    </>
                )}
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">{playlists}</span>
                    <span className="text-sm text-muted-foreground mt-1">Total Playlists</span>
                </div>
            </div>
        </CardContent>
    </Card>
    )
}