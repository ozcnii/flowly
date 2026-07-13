import { getDb } from "@/lib/cloudflare";
import { readSessionToken } from "./cookies";
import { verifySession } from "./session";

/** Returns the authenticated user id, or null. Refreshes sliding session on success. */
export async function getSessionUserId(request: Request): Promise<string | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  const verified = await verifySession(getDb(), token);
  return verified?.userId ?? null;
}
