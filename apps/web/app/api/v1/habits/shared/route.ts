import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { listHabitsSharedWithMe } from "@/lib/shares/service";

/** GET /api/v1/habits/shared — habits shared with current user (S-MA-083 list). */
export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await listHabitsSharedWithMe(getDb(), userId);
  return NextResponse.json({ items });
}
