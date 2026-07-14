import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@flowly/database";
import { nowIso } from "@flowly/core";
import { getDb } from "@/lib/cloudflare";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser, publicUser } from "@/lib/auth/users";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { mePatchSchema } from "@/lib/auth/schemas";
import { audit, rejectOversizedBody } from "@/lib/auth/http";

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await getUser(getDb(), userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = mePatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const db = getDb();
  await db
    .update(schema.users)
    .set({ ...parsed.data, updatedAt: nowIso() })
    .where(eq(schema.users.id, userId));
  audit("me.patch", { userId });
  const user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
