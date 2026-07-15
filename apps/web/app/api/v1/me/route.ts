import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@flowly/database";
import { nowIso } from "@flowly/core";
import { getDb } from "@/lib/cloudflare";
import { getSessionUserId } from "@/lib/auth/session-user";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { isDevEmulationEnabled } from "@/lib/auth/dev";
import { findOrCreateUser, getReportSettings, getUser, publicUser } from "@/lib/auth/users";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { mePatchSchema } from "@/lib/auth/schemas";
import { audit, rejectOversizedBody } from "@/lib/auth/http";

const DEV_USER = { id: 777001, first_name: "Анна", last_name: "", username: "anna_flowly", language_code: "ru" };

export async function GET(request: Request) {
  const db = getDb();
  const userId = await getSessionUserId(request);
  if (!userId) {
    if (!isDevEmulationEnabled()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { id } = await findOrCreateUser(db, DEV_USER);
    const user = await getUser(db, id);
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const res = NextResponse.json({ user: publicUser(user), settings: await getReportSettings(db, id), dev: true });
    setSessionCookie(res, await createSession(db, id));
    return res;
  }
  const user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user), settings: await getReportSettings(db, userId) });
}

export async function PATCH(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = mePatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const db = getDb();
  const { weeklyReportEnabled, monthlyReportEnabled, ...userPatch } = parsed.data;
  if (Object.keys(userPatch).length) await db.update(schema.users).set({ ...userPatch, updatedAt: nowIso() }).where(eq(schema.users.id, userId));
  if (weeklyReportEnabled !== undefined || monthlyReportEnabled !== undefined) await db.update(schema.userSettings).set({ ...(weeklyReportEnabled === undefined ? {} : { weeklyReportEnabled }), ...(monthlyReportEnabled === undefined ? {} : { monthlyReportEnabled }) }).where(eq(schema.userSettings.userId, userId));
  audit("me.patch", { userId });
  const user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user), settings: await getReportSettings(db, userId) });
}
