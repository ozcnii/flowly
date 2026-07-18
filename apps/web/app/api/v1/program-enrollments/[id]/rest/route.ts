import { NextResponse } from "next/server";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { postProgramDayTerminal } from "@/lib/programs/program-day-status";

/** User rest on a program workout day — distinct from skip and planned rest (PRD §20.5). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id: enrollmentId } = await params;
  const body = await request.json().catch(() => ({})) as { dayNumber?: unknown };
  const dayNumber = typeof body.dayNumber === "number" ? body.dayNumber : Number(body.dayNumber);
  const res = await postProgramDayTerminal(getDb(), userId, enrollmentId, dayNumber, "rest");
  if (res.ok) {
    const data = await res.clone().json() as { created?: boolean; occurrence?: { id: string }; scheduledLocalDate?: string };
    audit("program.rest", { userId, enrollmentId, dayNumber, occurrenceId: data.occurrence?.id, created: data.created, scheduledLocalDate: data.scheduledLocalDate });
  }
  return res;
}
