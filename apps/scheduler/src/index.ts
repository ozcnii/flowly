import { generateHabitDataForToday } from "./habit-generation";
import { processDueReminderJobs } from "./delivery";
import { closeNoResponseForYesterday } from "./no-response";
import { deliverDueReports } from "./reports-delivery";
import { runWeeklyBackup } from "./backup";
import { evaluateDeliveryBatch, notifyBackupResult, recordSchedulerResult } from "./owner-alerts";

type Env = {
  DB: D1Database;
  WEB?: Fetcher;
  STORAGE?: R2Bucket;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_MODE?: string;
  FLOWLY_WEB_URL?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  FLOWLY_OWNER_TELEGRAM_ID?: string;
};

async function purgeExpiredDeletions(db: D1Database): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const expired = await db.prepare(`SELECT id FROM users WHERE deleted_at IS NOT NULL AND deleted_at < ?`).bind(cutoff).all<{ id: string }>();
  let n = 0;
  for (const row of expired.results ?? []) {
    const id = row.id;
    await db.batch([
      db.prepare(`DELETE FROM status_history WHERE occurrence_id IN (SELECT id FROM activity_occurrences WHERE user_id=?)`).bind(id),
      db.prepare(`DELETE FROM activity_occurrences WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM workout_sessions WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM reminder_jobs WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM favorites WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM habit_shares WHERE shared_with_user_id=? OR habit_id IN (SELECT id FROM habits WHERE owner_id=?)`).bind(id, id),
      db.prepare(`DELETE FROM workout_shares WHERE shared_by_user_id=? OR shared_with_user_id=?`).bind(id, id),
      db.prepare(`DELETE FROM friendships WHERE requester_id=? OR addressee_id=?`).bind(id, id),
      db.prepare(`DELETE FROM invite_links WHERE owner_id=?`).bind(id),
      db.prepare(`DELETE FROM program_enrollment_shares WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM program_enrollments WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM partner_reminds WHERE sender_id=? OR recipient_id=?`).bind(id, id),
      db.prepare(`DELETE FROM habit_schedule_rules WHERE habit_id IN (SELECT id FROM habits WHERE owner_id=?)`).bind(id),
      db.prepare(`DELETE FROM habits WHERE owner_id=?`).bind(id),
      db.prepare(`DELETE FROM workouts WHERE owner_id=?`).bind(id),
      db.prepare(`DELETE FROM user_settings WHERE user_id=?`).bind(id),
      db.prepare(`DELETE FROM auth_sessions WHERE user_id=?`).bind(id),
      db
        .prepare(`UPDATE users SET telegram_id=?, username=NULL, first_name='Удалённый', last_name=NULL, onboarding_completed_at=NULL, updated_at=? WHERE id=?`)
        .bind(`deleted:${id}`, new Date().toISOString(), id),
    ]);
    n += 1;
  }
  return n;
}

export default {
  fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/health") {
      return Response.json({
        service: "flowly-scheduler",
        status: "ok",
        delivery: "enabled",
        generation: "habit_schedule",
        backup: "weekly_sun_03utc",
        mode: env.TELEGRAM_MODE ?? "production",
      });
    }
    if (pathname === "/admin/backup" && request.method === "POST") {
      // manual force for ops / test-scheduled environments
      return runWeeklyBackup(env, true).then((r) => Response.json(r));
    }
    return new Response("Not Found", { status: 404 });
  },
  scheduled(_controller: ScheduledController, env: Env, context: ExecutionContext) {
    context.waitUntil(
      (async () => {
        try {
          await generateHabitDataForToday(env.DB);
          const delivery = await processDueReminderJobs(env);
          await evaluateDeliveryBatch(env, delivery);
          await closeNoResponseForYesterday(env.DB);
          await deliverDueReports(env);
          const purged = await purgeExpiredDeletions(env.DB);
          if (purged) console.log(JSON.stringify({ event: "deletion.purged", purged }));
          const backup = await runWeeklyBackup(env, false);
          if (backup.ran) await notifyBackupResult(env, backup);
          await recordSchedulerResult(env, true);
        } catch (e) {
          console.log(JSON.stringify({ event: "scheduler.fatal", error: String(e).slice(0, 300) }));
          await recordSchedulerResult(env, false);
        }
      })(),
    );
  },
};
