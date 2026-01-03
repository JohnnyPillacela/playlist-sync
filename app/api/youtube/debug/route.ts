// /app/api/youtube/debug/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  const youtubeAccess = cookieStore.get("youtube_access_token");
  const youtubeRefresh = cookieStore.get("youtube_refresh_token");

  return NextResponse.json({
    youtube_access_token_present: !!youtubeAccess,
    youtube_refresh_token_present: !!youtubeRefresh,
    youtube_access_token_meta: youtubeAccess
      ? {
          name: youtubeAccess.name,
        }
      : null,
  });
}
