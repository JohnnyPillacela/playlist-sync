// /api/spotify/auth

import { _fetchTokenDetails } from "@/lib/spotify/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const tokenDetails = await _fetchTokenDetails();
    return NextResponse.json(null);
}
