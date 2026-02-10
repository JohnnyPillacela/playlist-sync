// /app/page.tsx

import { Button } from "@/components/ui/button";
import { LoginServiceButton } from "@/components/login-service-button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-ambient dark:bg-ambient-dark">
      <ThemeToggle className="absolute right-4 top-4" />
      <h1 className="mb-4 text-4xl font-semibold">Waves Sync</h1>
      <Link href="/dashboard">
        <Button variant="outline" size="lg">
          View all playlists
        </Button>
      </Link>
      <LoginServiceButton
        service="spotify"
        authUrl="/api/spotify/auth"
      />
      <LoginServiceButton
        service="youtube"
        authUrl="/api/youtube/auth"
      />
    </div>
  );
}
