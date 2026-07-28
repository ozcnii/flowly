import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, or } from "drizzle-orm";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { sendPartnerRemind } from "@/lib/friends/partner-remind";

const bodySchema = z.object({
  entityType: z.enum(["habit", "workout"]),
  entityId: z.string().min(1),
});

/**
 * POST /api/v1/friends/:id/remind
 * `:id` is friendship id; recipient is the other party.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id: friendshipId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const db = getDb();
  const row = (
    await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.id, friendshipId),
          eq(schema.friendships.status, "accepted"),
          or(eq(schema.friendships.requesterId, userId), eq(schema.friendships.addresseeId, userId)),
        ),
      )
      .limit(1)
  )[0];
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const recipientId = row.requesterId === userId ? row.addresseeId : row.requesterId;
  if (!recipientId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const result = await sendPartnerRemind(db, userId, {
    recipientId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
  });
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "forbidden") return NextResponse.json({ error: "forbidden", message: result.message }, { status: 403 });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  if (result.kind === "rate_limited") {
    return NextResponse.json({ error: "rate_limited", message: result.message }, { status: 429 });
  }
  audit("friends.partner_remind", { userId, friendshipId, recipientId, ...parsed.data });
  return NextResponse.json({ ok: true });
}
