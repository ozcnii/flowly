import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getDb } from "@/lib/cloudflare";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit } from "@/lib/auth/http";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getReportSettings, getUser, publicUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  let user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.onboardingCompletedAt) {
    await db.update(schema.users).set({ onboardingCompletedAt: nowIso(), updatedAt: nowIso() }).where(eq(schema.users.id, userId));
    audit("onboarding.complete", { userId });
    user = await getUser(db, userId);
  }
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user), settings: await getReportSettings(db, userId) });
}
