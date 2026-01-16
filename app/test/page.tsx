// /app/test/page.tsx

import { transfer } from "@/lib/transfer/spotify-to-youtube";

export default async function TestPage() {
    const testResult = await transfer({
        spotifyPlaylistId: "5Iavgt4CvEYZ2tJXfyqNPw",
        playlistName: "Love"
    });

    if (testResult.ok) {
        console.log("🧪 TEST RESULT:", testResult.data);
        const tracks = testResult.data.matchedTracks;
        console.log("🧪 TRACKS:", tracks);
    } else {
        console.error("🧪 TEST ERROR:", testResult.error);
    }
}

