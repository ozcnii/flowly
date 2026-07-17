import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { getOwnedSession } from "@/lib/workout-sessions";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const session = await getOwnedSession(getDb(), userId, (await params).id);
  return session ? NextResponse.json({ session }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
