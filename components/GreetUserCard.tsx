// /components/GreetUserCard.tsx

import { SpotifyUser } from "@/lib/constants/spotify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

interface GreetUserCardProps {
    user: SpotifyUser;
    playlists: number;
}

export default function GreetUserCard({ user, playlists }: GreetUserCardProps) {
    return (
        <Card>
        <CardHeader>
            <CardTitle className="text-5xl font-bold">Welcome back, {user.display_name}!</CardTitle>
            <CardDescription className="text-xl mt-2">
                Here's your playlist overview
            </CardDescription>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-base text-muted-foreground">
                {user.email && (
                    <span className="flex items-center">
                        {user.email}
                    </span>
                )}
                {user.country && (
                    <>
                        <span className="text-border">•</span>
                        <span>{user.country}</span>
                    </>
                )}
            </div>
            <div className="mt-4">
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-3xl font-semibold">{user.product === 'premium' ? 'Premium' : 'Free'}</span>
                    <span className="text-sm text-muted-foreground mt-1">Subscription Status</span>
                </div> 
                <div className="h-12 w-px bg-border"></div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">{playlists}</span>
                    <span className="text-sm text-muted-foreground mt-1">Total Playlists</span>
                </div>

            </div>
        </CardContent>
    </Card>
    )
}