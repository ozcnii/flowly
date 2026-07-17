import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { getActiveSession } from "@/lib/workout-sessions";

export async function GET(request: Request) {
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ session: await getActiveSession(getDb(), userId) });
}
