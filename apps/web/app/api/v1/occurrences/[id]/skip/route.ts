import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { transitionHabitOccurrence } from "@/lib/habits/occurrence-status";
import { occurrenceStatusMutationSchema } from "@/features/rhythm/model/occurrences";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const comment = body && typeof body === "object" ? (body as { comment?: unknown }).comment : undefined;
  const parsed = occurrenceStatusMutationSchema.shape.comment.safeParse(comment);
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  const result = await transitionHabitOccurrence(getDb(), userId, (await params).id, "skipped", parsed.data ?? null, "habit_skip");
  if (result.kind === "ok") {
    audit("habit.occurrence.skip", { userId, occurrenceId: (await params).id, idempotent: result.idempotent });
    return NextResponse.json({ occurrence: result.occurrence, idempotent: result.idempotent });
  }
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid_status", message: result.message }, { status: 400 });
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
