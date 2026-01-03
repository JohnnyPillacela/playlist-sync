// /app/api/dev/clear-cookies/route.ts

import { NextResponse } from "next/server";
import { deleteAuthCookies } from "@/lib/cookies/state";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Cookies cleared" });
    deleteAuthCookies(response);
    return response;
}

