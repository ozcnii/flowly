import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

/**
 * Create a Drizzle client bound to a Cloudflare D1 database.
 *
 * Consumers obtain the D1 binding from their Worker environment:
 * - apps/web (OpenNext): getRequestContext().env.DB
 * - apps/scheduler: env.DB (stage 3+)
 */
export function createDatabase(d1: D1Database) {
  return drizzle(d1, { schema });
}

export * as schema from "./schema";
