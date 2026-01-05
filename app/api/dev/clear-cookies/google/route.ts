// /app/api/dev/clear-cookies/google/route.ts

import { NextResponse } from "next/server";
import { deleteGoogleAuthCookies } from "@/lib/cookies/state";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Google cookies cleared" });
    deleteGoogleAuthCookies(response);
    return response;
}