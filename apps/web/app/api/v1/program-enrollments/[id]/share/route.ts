import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { shareEnrollment } from "@/lib/programs/joint";

const bodySchema = z.object({ userId: z.string().min(1) });

/** POST /api/v1/program-enrollments/:id/share — invite friend to joint program. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await shareEnrollment(getDb(), id, userId, parsed.data.userId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  audit("program.enrollment_share", { userId, enrollmentId: id, withUserId: parsed.data.userId });
  return NextResponse.json({ ok: true, idempotent: result.idempotent });
}
