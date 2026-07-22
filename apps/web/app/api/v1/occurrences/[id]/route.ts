import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { getOccurrenceHistory, loadOwnedHabitOccurrence } from "@/lib/habits/occurrence-status";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDb(), target = await loadOwnedHabitOccurrence(db, userId, (await params).id);
  if (!target || target.habit.status === "archived") return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ occurrence: target.occurrence, habit: target.habit, history: await getOccurrenceHistory(db, target.occurrence.id) });
}
