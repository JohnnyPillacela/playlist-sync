// /app/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="mb-4 text-4xl font-semibold">Welcome to the playlist sync app!</h1>
      <Button variant="outline" size="lg" onClick={() => router.push('/dashboard')}>
        View all playlists
      </Button>
    </div>
  );
}
