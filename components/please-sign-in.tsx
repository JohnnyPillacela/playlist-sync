// /components/please-sign-in.tsx

import Link from "next/link";
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function PleaseSignIn({ musicProvider }: { musicProvider: string }) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Not Signed In</CardTitle>
                <CardDescription className="text-center mt-2">
                    Please sign in with {musicProvider} to view your playlists
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button asChild>
                    <Link href="/">Sign In with {musicProvider}</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
    )
}