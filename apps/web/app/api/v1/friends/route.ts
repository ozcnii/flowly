import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { listFriends } from "@/lib/friends/service";

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const friends = await listFriends(getDb(), userId);
  return NextResponse.json({ friends });
}
