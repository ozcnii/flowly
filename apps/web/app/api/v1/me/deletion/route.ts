import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getDb } from "@/lib/cloudflare";
import { cancelAccountDeletion, deletionDeadline, inGrace, requestAccountDeletion } from "@/lib/me/data-lifecycle";

/** GET /api/v1/me/deletion — grace status. */
export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = (await getDb().select().from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    deletedAt: user.deletedAt,
    inGrace: inGrace(user.deletedAt),
    purgeAt: user.deletedAt ? deletionDeadline(user.deletedAt) : null,
  });
}

/** POST /api/v1/me/deletion — request 7-day grace deletion. */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await requestAccountDeletion(getDb(), userId);
  audit("me.deletion.request", { userId, ...result });
  return NextResponse.json({ ok: true, ...result });
}

/** DELETE /api/v1/me/deletion — cancel during grace. */
export async function DELETE(request: Request) {
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await cancelAccountDeletion(getDb(), userId);
  audit("me.deletion.cancel", { userId, ...result });
  if (!result.cancelled) return NextResponse.json({ error: result.reason }, { status: 400 });
  return NextResponse.json({ ok: true });
}
