import { generateId, nowIso } from "@flowly/core";

const OPEN = new Set(["scheduled", "due", "notified", "snoozed"]);

/**
 * After local day ends (user timezone): open occurrences → no_response (DEC-015, §26.1).
 * Never auto-skip. Cancels pending jobs.
 */
export async function closeNoResponseForYesterday(db: D1Database): Promise<number> {
  const users = await db.prepare(`SELECT id, timezone FROM users WHERE deleted_at IS NULL`).all<{ id: string; timezone: string }>();
  let closed = 0;
  const ts = nowIso();

  for (const user of users.results ?? []) {
    let yesterday: string;
    try {
      const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: user.timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
      const parts = fmt.formatToParts(new Date(Date.now() - 24 * 60 * 60_000));
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;
      yesterday = `${y}-${m}-${d}`;
    } catch {
      yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    }

    const occs = await db
      .prepare(
        `SELECT id, status FROM activity_occurrences WHERE user_id=? AND scheduled_local_date=? AND status IN ('scheduled','due','notified','snoozed')`,
      )
      .bind(user.id, yesterday)
      .all<{ id: string; status: string }>();

    for (const occ of occs.results ?? []) {
      if (!OPEN.has(occ.status)) continue;
      const hid = generateId();
      await db.batch([
        db
          .prepare(
            `INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at)
             VALUES (?,?,?,?,?,?,NULL,?)`,
          )
          .bind(hid, occ.id, occ.status, "no_response", user.id, "day_close", ts),
        db
          .prepare(`UPDATE activity_occurrences SET status='no_response', source='day_close', updated_at=? WHERE id=? AND status=?`)
          .bind(ts, occ.id, occ.status),
        db
          .prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='no_response' WHERE occurrence_id=? AND user_id=? AND status='pending'`)
          .bind(occ.id, user.id),
      ]);
      closed++;
    }
  }
  if (closed) console.log(JSON.stringify({ event: "telegram.no_response.closed", closed, at: ts }));
  return closed;
}
