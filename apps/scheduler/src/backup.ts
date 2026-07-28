import { generateId, nowIso } from "@flowly/core";

/** Tables dumped for weekly system backup (DEC-008). */
const TABLES = [
  "users",
  "user_settings",
  "auth_sessions",
  "friendships",
  "invite_links",
  "workout_categories",
  "workouts",
  "workout_category_links",
  "exercises",
  "workout_exercises",
  "activity_occurrences",
  "workout_sessions",
  "status_history",
  "favorites",
  "programs",
  "program_days",
  "program_enrollments",
  "program_enrollment_shares",
  "partner_reminds",
  "reminder_policies",
  "reminder_policy_steps",
  "reminder_jobs",
  "habits",
  "habit_schedule_rules",
  "workout_shares",
  "habit_shares",
  "challenges",
  "challenge_members",
  "reactions",
  "youtube_search_cache",
  "processed_telegram_updates",
  "system_backups",
  "ops_state",
  "user_export_jobs",
] as const;

export type BackupEnv = {
  DB: D1Database;
  STORAGE?: R2Bucket;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_MODE?: string;
  FLOWLY_OWNER_TELEGRAM_ID?: string;
};

/** Sunday 03:00–03:04 UTC gate for weekly backup. */
export function isWeeklyBackupWindow(now = new Date()): boolean {
  return now.getUTCDay() === 0 && now.getUTCHours() === 3 && now.getUTCMinutes() < 5;
}

async function dumpTables(db: D1Database): Promise<{ tables: Record<string, unknown[]>; tableCount: number }> {
  const tables: Record<string, unknown[]> = {};
  let tableCount = 0;
  for (const name of TABLES) {
    try {
      const res = await db.prepare(`SELECT * FROM ${name}`).all();
      tables[name] = res.results ?? [];
      tableCount += 1;
    } catch {
      /* table may not exist yet on partial envs */
    }
  }
  return { tables, tableCount };
}

async function pruneBackups(db: D1Database, storage: R2Bucket | undefined, keep = 4) {
  const rows = await db.prepare(`SELECT id, storage_key FROM system_backups WHERE status='ok' ORDER BY created_at DESC`).all<{ id: string; storage_key: string | null }>();
  const list = rows.results ?? [];
  for (const row of list.slice(keep)) {
    if (row.storage_key && storage) {
      try {
        await storage.delete(row.storage_key);
      } catch {
        /* ignore */
      }
    }
    await db.prepare(`DELETE FROM system_backups WHERE id=?`).bind(row.id).run();
  }
}

export async function runWeeklyBackup(env: BackupEnv, force = false): Promise<{ ran: boolean; ok: boolean; id?: string; error?: string; sizeBytes?: number }> {
  if (!force && !isWeeklyBackupWindow()) return { ran: false, ok: true };
  // skip if already succeeded today
  if (!force) {
    const day = new Date().toISOString().slice(0, 10);
    const existing = await env.DB.prepare(`SELECT id FROM system_backups WHERE status='ok' AND created_at LIKE ? LIMIT 1`).bind(`${day}%`).first();
    if (existing) return { ran: false, ok: true };
  }

  const id = generateId();
  const ts = nowIso();
  try {
    const { tables, tableCount } = await dumpTables(env.DB);
    const payload = JSON.stringify({ exportedAt: ts, version: 1, tables });
    const sizeBytes = payload.length;
    if (sizeBytes > 40 * 1024 * 1024) throw new Error("backup_too_large");

    let storageKey: string | null = null;
    if (env.STORAGE) {
      storageKey = `backups/d1/${ts.slice(0, 10)}.json`;
      await env.STORAGE.put(storageKey, payload, { httpMetadata: { contentType: "application/json" } });
    }

    await env.DB.prepare(
      `INSERT INTO system_backups (id, created_at, size_bytes, table_count, storage_key, status, error, payload) VALUES (?, ?, ?, ?, ?, 'ok', NULL, ?)`,
    )
      .bind(id, ts, sizeBytes, tableCount, storageKey, env.STORAGE ? null : payload)
      .run();

    await pruneBackups(env.DB, env.STORAGE, 4);
    return { ran: true, ok: true, id, sizeBytes };
  } catch (e) {
    const error = String(e).slice(0, 300);
    await env.DB.prepare(
      `INSERT INTO system_backups (id, created_at, size_bytes, table_count, storage_key, status, error, payload) VALUES (?, ?, 0, 0, NULL, 'failed', ?, NULL)`,
    )
      .bind(id, ts, error)
      .run();
    return { ran: true, ok: false, id, error };
  }
}
