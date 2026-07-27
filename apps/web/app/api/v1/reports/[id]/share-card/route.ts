import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { getSessionUserId } from "@/lib/auth/session-user";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";

/**
 * POST /api/v1/reports/:id/share-card — safe summary card (DEC-018, 30-day retention intent).
 * id: `week:YYYY-MM-DD` or `month:YYYY-MM-DD` (anchor date).
 * Does not store private habit titles / medical cues.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const [kind, date] = id.split(":");
  if ((kind !== "week" && kind !== "month") || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    includeWorkouts?: boolean;
    includeHabitsPercent?: boolean;
    includeStreak?: boolean;
    workoutsCompleted?: number;
    habitPercent?: number;
    streak?: number;
  };
  const lines: string[] = ["Flowly"];
  if (body.includeWorkouts !== false && body.workoutsCompleted != null) lines.push(`Тренировки: ${body.workoutsCompleted}`);
  if (body.includeHabitsPercent !== false && body.habitPercent != null) lines.push(`Привычки: ${body.habitPercent}%`);
  if (body.includeStreak && body.streak != null) lines.push(`Серия: ${body.streak}`);
  const cardId = generateId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();
  audit("reports.share_card", { userId, cardId, kind, date });
  return NextResponse.json({
    id: cardId,
    kind,
    date,
    text: lines.join("\n"),
    // No private names/comments
    expiresAt,
    createdAt: nowIso(),
    retentionDays: 30,
  });
}
