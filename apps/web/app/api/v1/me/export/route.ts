import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getDb } from "@/lib/cloudflare";
import { createAndNotifyExport } from "@/lib/me/data-export";

/** POST /api/v1/me/export — build protected JSON archive (§51.2) + bot notice. */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { jobId, payload, sizeBytes } = await createAndNotifyExport(getDb(), userId);
    audit("me.export", { userId, jobId, sizeBytes });
    return NextResponse.json({ jobId, sizeBytes, export: payload });
  } catch (e) {
    audit("me.export.error", { userId, error: String(e).slice(0, 200) });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
