import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { createChallenge, listChallengesForUser } from "@/lib/challenges/service";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  goalType: z.enum(["workout_count", "daily", "habit_count", "total_time"]),
  goalValue: z.number().int().min(1).max(100_000),
  startsOn: z.string(),
  endsOn: z.string(),
  memberIds: z.array(z.string().min(1)).max(20).optional(),
});

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await listChallengesForUser(getDb(), userId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  const result = await createChallenge(getDb(), userId, parsed.data);
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  audit("challenge.create", { userId, challengeId: result.id });
  return NextResponse.json({ id: result.id }, { status: 201 });
}
