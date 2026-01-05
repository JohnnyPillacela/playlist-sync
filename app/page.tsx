// /app/page.tsx

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="mb-4 text-4xl font-semibold">Welcome to the playlist sync app!</h1>
      <Link href="/dashboard">
        <Button variant="outline" size="lg">
          View all playlists
        </Button>
      </Link>
      <Link href="/api/spotify/auth">
        <Button variant="default" size="lg">
          Login with Spotify
        </Button>
      </Link>
      <Link href="/api/youtube/auth">
        <Button variant="default" size="lg">
          Login with Google
        </Button>
      </Link>
    </div>
  );
}
