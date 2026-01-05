// /app/page.tsx

import { Button } from "@/components/ui/button";
import { LoginServiceButton } from "@/components/login-service-button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="mb-4 text-4xl font-semibold">Welcome to the playlist sync app!</h1>
      <Link href="/dashboard">
        <Button variant="outline" size="lg">
          View all playlists
        </Button>
      </Link>
      <LoginServiceButton
        serviceName="Spotify"
        authUrl="/api/spotify/auth"
      />
      <LoginServiceButton
        serviceName="Google"
        authUrl="/api/youtube/auth"
      />
    </div>
  );
}
