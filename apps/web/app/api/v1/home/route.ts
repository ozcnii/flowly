import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { buildHomeViewModel } from "@/lib/home/build-home";

/** GET /api/v1/home — real Home plan for today (habits + program + progress). */
export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const home = await buildHomeViewModel(getDb(), userId);
    return NextResponse.json({ home });
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return NextResponse.json({ error: "home_unavailable", message: String(error).slice(0, 200) }, { status: 500 });
  }
}
