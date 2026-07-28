import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { listReactions, setReaction } from "@/lib/challenges/service";

const bodySchema = z.object({
  recipientId: z.string().min(1),
  emoji: z.enum(["👏", "🔥", "💪", "❤️", "🙌"]),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await listReactions(getDb(), "challenge", id, userId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ reactions: result.reactions });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await setReaction(getDb(), userId, {
    recipientId: parsed.data.recipientId,
    entityType: "challenge",
    entityId: id,
    emoji: parsed.data.emoji,
  });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  if (result.kind === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  audit("challenge.reaction", { userId, challengeId: id, action: result.action });
  return NextResponse.json({ ok: true, action: result.action });
}
