import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { listHabitShares, shareHabit } from "@/lib/shares/service";

const bodySchema = z.object({
  userId: z.string().min(1),
  showStreak: z.boolean().optional(),
  showHistory: z.boolean().optional(),
});

/** GET /api/v1/habits/:id/share — list active shares (owner only, S-MA-084). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await listHabitShares(getDb(), id, userId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ shares: result.shares });
}

/** POST /api/v1/habits/:id/share — share with accepted friend (PRD §44.7). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await shareHabit(getDb(), id, userId, parsed.data.userId, {
    showStreak: parsed.data.showStreak,
    showHistory: parsed.data.showHistory,
  });
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  audit("habit.share", { userId, habitId: id, withUserId: parsed.data.userId });
  return NextResponse.json({ ok: true });
}
