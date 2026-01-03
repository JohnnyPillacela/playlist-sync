// /app/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { redirectToSpotifyAuth } from "@/lib/spotify/spotify-pkce";

export default function Home() {
  const router = useRouter();

  const handleSpotifyLogin = async () => {
    try {
        console.log('Starting Spotify authorization...');
        await redirectToSpotifyAuth();
        console.log('Authorization function completed');
    } catch (error) {
        console.error('Authorization failed:', error);
        alert(`Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/youtube/auth';
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="mb-4 text-4xl font-semibold">Welcome to the playlist sync app!</h1>
      <Button variant="outline" size="lg" onClick={() => router.push('/dashboard')}>
        View all playlists
      </Button>
      <Button variant="default" size="lg" onClick={handleSpotifyLogin}>
       Login with Spotify
      </Button>
      <Button variant="default" size="lg" onClick={handleGoogleLogin}>
        Login with Google
      </Button>
    </div>
  );
}
