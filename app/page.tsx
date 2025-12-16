// /app/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      Welcome to the playlist sync app!

      <br />
      <Button variant="outline" onClick={() => router.push('/dashboard')}>View all playlists</Button>
    </div>
  );
}
