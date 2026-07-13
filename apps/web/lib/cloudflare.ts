import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabase, type Database } from "@flowly/database";
import type { AnyD1Database } from "drizzle-orm/d1";

/**
 * Bridges OpenNext's request context to typed bindings.
 * The D1 binding (`DB`) is declared at the top level of wrangler.jsonc for local
 * dev/preview; `TELEGRAM_BOT_TOKEN` is a Cloudflare secret. The generated
 * CloudflareEnv (test env) may omit them, so we cast through `unknown`.
 */
interface WebEnv {
  DB?: AnyD1Database;
  TELEGRAM_BOT_TOKEN?: string;
}

function webEnv(): WebEnv {
  return getCloudflareContext().env as unknown as WebEnv;
}

export function getDb(): Database {
  const db = webEnv().DB;
  if (!db) throw new Error("D1 binding 'DB' is not available in this environment");
  return createDatabase(db);
}

export function getBotToken(): string {
  const token = webEnv().TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN secret is not configured");
  return token;
}
