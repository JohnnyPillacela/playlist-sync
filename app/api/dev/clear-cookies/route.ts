// /app/api/dev/clear-cookies/route.ts

import { NextResponse } from "next/server";
import { deleteServiceProvidersTokens } from "@/lib/cookies/state";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Cookies cleared" });
    deleteServiceProvidersTokens(response);
    return response;
}

