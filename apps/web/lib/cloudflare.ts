import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabase, type Database } from "@flowly/database";
import { createStorage, type StorageAdapter } from "@flowly/storage";
import type { AnyD1Database } from "drizzle-orm/d1";
import type { R2Bucket } from "@cloudflare/workers-types";

/**
 * Bridges OpenNext's request context to typed bindings.
 * The D1 binding (`DB`) is declared at the top level of wrangler.jsonc for local
 * dev/preview; `TELEGRAM_BOT_TOKEN` is a Cloudflare secret. The generated
 * CloudflareEnv (test env) may omit them, so we cast through `unknown`.
 */
interface WebEnv {
  DB?: AnyD1Database;
  STORAGE?: R2Bucket;
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

/**
 * R2 storage adapter (PRD §46). Binding `STORAGE` declared at the top level of
 * wrangler.jsonc for local dev/preview; real test/prod bucket — separate scope.
 * No direct public access: read/write only via this adapter (auth routes — этап 2).
 */
export function getStorage(): StorageAdapter {
  const bucket = webEnv().STORAGE;
  if (!bucket) throw new Error("R2 binding 'STORAGE' is not available in this environment");
  return createStorage(bucket);
}
