import { eq } from "drizzle-orm";
import type { Database } from "@flowly/database";
import { schema } from "@flowly/database";
import { generateId, isoFromNowMs, nowIso, SESSION_TTL_MS } from "@flowly/core";

const TOKEN_BYTES = 32;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(db: Database, userId: string): Promise<string> {
  const token = randomToken();
  await db.insert(schema.authSessions).values({
    id: generateId(),
    userId,
    tokenHash: await sha256Hex(token),
    expiresAt: isoFromNowMs(SESSION_TTL_MS),
    lastUsedAt: nowIso(),
    createdAt: nowIso(),
  });
  return token;
}

export async function verifySession(
  db: Database,
  token: string,
): Promise<{ userId: string } | null> {
  const tokenHash = await sha256Hex(token);
  const rows = await db
    .select()
    .from(schema.authSessions)
    .where(eq(schema.authSessions.tokenHash, tokenHash))
    .limit(1);
  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;

  // Sliding renewal: only when past half-life, to limit writes (D1 free tier).
  const remainingMs = new Date(session.expiresAt).getTime() - Date.now();
  if (remainingMs < SESSION_TTL_MS / 2) {
    await db
      .update(schema.authSessions)
      .set({ lastUsedAt: nowIso(), expiresAt: isoFromNowMs(SESSION_TTL_MS) })
      .where(eq(schema.authSessions.id, session.id));
  }
  return { userId: session.userId };
}

export async function destroySession(db: Database, token: string): Promise<void> {
  const tokenHash = await sha256Hex(token);
  await db.delete(schema.authSessions).where(eq(schema.authSessions.tokenHash, tokenHash));
}
