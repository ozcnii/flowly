import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { sendPartnerRemind } from "@/lib/friends/partner-remind";

const bodySchema = z.object({
  recipientId: z.string().min(1),
  entityType: z.enum(["habit", "workout"]),
  entityId: z.string().min(1),
});

/** POST /api/v1/partner-reminds — partner remind (PRD §35, 2h limit). */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await sendPartnerRemind(getDb(), userId, parsed.data);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "forbidden") return NextResponse.json({ error: "forbidden", message: result.message }, { status: 403 });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  if (result.kind === "rate_limited") {
    return NextResponse.json({ error: "rate_limited", message: result.message }, { status: 429 });
  }
  audit("partner_remind", { userId, ...parsed.data });
  return NextResponse.json({ ok: true });
}
