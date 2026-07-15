import { NextResponse } from "next/server";
import { getDb } from "@/lib/cloudflare";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { telegramPhotoUrl } from "@/lib/telegram-photo";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const telegramCdn = (hostname: string) => /^cdn\d+\.telesco\.pe$/.test(hostname);

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return new NextResponse(null, { status: 401 });
  const user = await getUser(getDb(), userId);
  const source = telegramPhotoUrl(user?.photoUrl);
  if (!source) return new NextResponse(null, { status: 404 });

  let response = await fetch(source, { redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) return new NextResponse(null, { status: 502 });
    const target = new URL(location, source);
    if (target.protocol !== "https:" || !telegramCdn(target.hostname)) return new NextResponse(null, { status: 502 });
    response = await fetch(target, { redirect: "error" });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.startsWith("image/")) return new NextResponse(null, { status: 502 });
  const photo = await response.arrayBuffer();
  if (photo.byteLength > MAX_PHOTO_BYTES) return new NextResponse(null, { status: 502 });
  return new NextResponse(photo, { headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=300" } });
}
