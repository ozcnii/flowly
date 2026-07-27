import { generateId, nowIso } from "@flowly/core";

const BATCH = 50;
const MAX_ATTEMPTS = 5;
const TERMINAL = new Set(["completed", "partially_completed", "rest", "skipped", "no_response", "cancelled", "expired"]);

type Env = {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_MODE?: string;
  FLOWLY_WEB_URL?: string;
  /** Same as web TELEGRAM_WEBHOOK_SECRET — auth for /api/v1/telegram/outbound proxy. */
  TELEGRAM_WEBHOOK_SECRET?: string;
};

type JobRow = {
  id: string;
  occurrence_id: string;
  user_id: string;
  policy_id: string;
  step_number: number;
  due_at_utc: string;
  attempt_count: number;
  idempotency_key: string;
};

const permanent = (code: string) =>
  /403|blocked|chat not found|user is deactivated|bot was blocked/i.test(code);

async function sendTelegram(env: Env, chatId: string, text: string, replyMarkup: unknown): Promise<{ ok: true; messageId?: string } | { ok: false; code: string; permanent: boolean }> {
  const mode = (env.TELEGRAM_MODE || "production").toLowerCase();
  if (mode === "mock") {
    console.log(JSON.stringify({ event: "telegram.delivery.mock", chatId, text: text.slice(0, 120) }));
    return { ok: true, messageId: `mock_${Date.now()}` };
  }

  // Prefer proxy through web worker (shares TELEGRAM_BOT_TOKEN secret).
  const base = (env.FLOWLY_WEB_URL || "https://flowly-web.getflowly.workers.dev").replace(/\/$/, "");
  if (base && env.TELEGRAM_WEBHOOK_SECRET) {
    try {
      const res = await fetch(`${base}/api/v1/telegram/outbound`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET,
          accept: "application/json",
        },
        body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
      });
      const raw = await res.text();
      let body: { ok?: boolean; code?: string; message_id?: string; error?: string } = {};
      try {
        body = JSON.parse(raw) as typeof body;
      } catch {
        body = {};
      }
      if (!res.ok || !body.ok) {
        // 404 is transient during web deploys; never permanent.
        const code = body.code || body.error || `proxy_http_${res.status}`;
        console.log(JSON.stringify({ event: "telegram.delivery.proxy_fail", status: res.status, code, base }));
        return { ok: false, code, permanent: permanent(code) || res.status === 403 };
      }
      return { ok: true, messageId: body.message_id };
    } catch (e) {
      return { ok: false, code: e instanceof Error ? e.message : "proxy_network", permanent: false };
    }
  }

  if (!env.TELEGRAM_BOT_TOKEN) {
    console.log(JSON.stringify({ event: "telegram.delivery.mock_no_token", chatId, text: text.slice(0, 120) }));
    return { ok: true, messageId: `mock_${Date.now()}` };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string; result?: { message_id?: number } };
    if (!res.ok || !body.ok) {
      const code = body.description || `http_${res.status}`;
      return { ok: false, code, permanent: permanent(code) || res.status === 403 };
    }
    return { ok: true, messageId: body.result?.message_id != null ? String(body.result.message_id) : undefined };
  } catch (e) {
    return { ok: false, code: e instanceof Error ? e.message : "network", permanent: false };
  }
}

function inQuietHours(nowLocal: Date, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const cur = nowLocal.getHours() * 60 + nowLocal.getMinutes();
  const s = toMin(start);
  const e = toMin(end);
  if (s === e) return false;
  return s < e ? cur >= s && cur < e : cur >= s || cur < e;
}

function localNow(timezone: string): Date {
  try {
    return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  } catch {
    return new Date();
  }
}

/** Claim due jobs, send Telegram, mark sent/failed, schedule next policy step. */
export async function processDueReminderJobs(env: Env): Promise<{ claimed: number; sent: number; failed: number; skipped: number }> {
  const now = nowIso();
  const due = await env.DB.prepare(
    `SELECT id, occurrence_id, user_id, policy_id, step_number, due_at_utc, attempt_count, idempotency_key
     FROM reminder_jobs WHERE status='pending' AND due_at_utc<=? ORDER BY due_at_utc ASC LIMIT ?`,
  )
    .bind(now, BATCH)
    .all<JobRow>();

  const jobs = due.results ?? [];
  let claimed = 0, sent = 0, failed = 0, skipped = 0;
  const base = (env.FLOWLY_WEB_URL || "https://flowly.app").replace(/\/$/, "");

  for (const job of jobs) {
    const lock = await env.DB.prepare(
      `UPDATE reminder_jobs SET status='sending', locked_at=? WHERE id=? AND status='pending'`,
    )
      .bind(now, job.id)
      .run();
    if (!lock.meta.changes) continue;
    claimed++;

    const occ = await env.DB.prepare(
      `SELECT id, user_id, entity_type, entity_id, scheduled_local_date, scheduled_local_time, status, timezone
       FROM activity_occurrences WHERE id=? AND user_id=?`,
    )
      .bind(job.occurrence_id, job.user_id)
      .first<{
        id: string;
        entity_type: string;
        entity_id: string;
        scheduled_local_time: string;
        status: string;
        timezone: string;
      }>();

    if (!occ || TERMINAL.has(occ.status)) {
      await env.DB.prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='occurrence_terminal', locked_at=NULL WHERE id=?`)
        .bind(job.id)
        .run();
      skipped++;
      continue;
    }

    const user = await env.DB.prepare(
      `SELECT telegram_id, timezone FROM users WHERE id=? AND deleted_at IS NULL`,
    )
      .bind(job.user_id)
      .first<{ telegram_id: string; timezone: string }>();

    if (!user) {
      await env.DB.prepare(`UPDATE reminder_jobs SET status='failed', error_code='user_missing', locked_at=NULL WHERE id=?`)
        .bind(job.id)
        .run();
      failed++;
      continue;
    }

    const settings = await env.DB.prepare(
      `SELECT quiet_hours_start, quiet_hours_end, quiet_hours_behavior FROM user_settings WHERE user_id=?`,
    )
      .bind(job.user_id)
      .first<{ quiet_hours_start: string | null; quiet_hours_end: string | null; quiet_hours_behavior: string | null }>();

    const tz = user.timezone || occ.timezone || "UTC";
    if (settings && inQuietHours(localNow(tz), settings.quiet_hours_start, settings.quiet_hours_end)) {
      const behavior = settings.quiet_hours_behavior || "defer";
      if (behavior === "skip") {
        await env.DB.prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='quiet_hours_skip', locked_at=NULL WHERE id=?`)
          .bind(job.id)
          .run();
        skipped++;
        continue;
      }
      // defer: push due +1h, keep pending
      const deferred = new Date(Date.now() + 60 * 60_000).toISOString();
      await env.DB.prepare(
        `UPDATE reminder_jobs SET status='pending', due_at_utc=?, locked_at=NULL, error_code='quiet_hours_defer' WHERE id=?`,
      )
        .bind(deferred, job.id)
        .run();
      skipped++;
      continue;
    }

    let text: string;
    let keyboard: unknown;
    if (occ.entity_type === "habit") {
      const habit = await env.DB.prepare(`SELECT title, emoji FROM habits WHERE id=?`).bind(occ.entity_id).first<{ title: string; emoji: string | null }>();
      const title = habit?.title ?? "Привычка";
      const emoji = habit?.emoji?.trim() || "📌";
      const dateRow = await env.DB.prepare(`SELECT scheduled_local_date FROM activity_occurrences WHERE id=?`)
        .bind(occ.id)
        .first<{ scheduled_local_date: string }>();
      const day = dateRow
        ? await env.DB.prepare(
            `SELECT status FROM activity_occurrences WHERE user_id=? AND entity_type='habit' AND entity_id=? AND scheduled_local_date=?`,
          )
            .bind(job.user_id, occ.entity_id, dateRow.scheduled_local_date)
            .all<{ status: string }>()
        : { results: [] as { status: string }[] };
      const rows = day.results ?? [];
      const completed = rows.filter((r) => r.status === "completed").length;
      const total = rows.length;
      text = [`${emoji} ${title}`, `Время: ${occ.scheduled_local_time}`, total > 0 ? `Сегодня: ${completed} из ${total} выполнено` : null]
        .filter(Boolean)
        .join("\n");
      keyboard = {
        inline_keyboard: [
          [{ text: "✅ Готово", callback_data: `d:${occ.id}` }],
          [
            { text: "⏰ 30 мин", callback_data: `s30:${occ.id}` },
            { text: "⏰ 1 час", callback_data: `s60:${occ.id}` },
          ],
          [{ text: "❌ Сегодня пропущу", callback_data: `sk:${occ.id}` }],
          [{ text: "📱 Открыть Flowly", web_app: { url: `${base}/?tg=1` } }],
        ],
      };
    } else {
      const workout = await env.DB.prepare(`SELECT title, duration_seconds FROM workouts WHERE id=?`)
        .bind(occ.entity_id)
        .first<{ title: string; duration_seconds: number }>();
      const mins = workout?.duration_seconds ? Math.round(workout.duration_seconds / 60) : null;
      const line = mins ? `${workout?.title ?? "Тренировка"} — ${mins} минут` : (workout?.title ?? "Тренировка");
      text = `🧘 Время для практики\n${line}`;
      keyboard = {
        inline_keyboard: [
          [{ text: "▶ Начать", web_app: { url: `${base}/workouts/${occ.entity_id}?tg=1` } }],
          [{ text: "✅ Уже выполнено", callback_data: `d:${occ.id}` }],
          [
            { text: "⏰ 30 мин", callback_data: `s30:${occ.id}` },
            { text: "⏰ 1 час", callback_data: `s60:${occ.id}` },
          ],
          [{ text: "🌿 Сегодня отдыхаю", callback_data: `r:${occ.id}` }],
          [{ text: "📱 Открыть Flowly", web_app: { url: `${base}/?tg=1` } }],
        ],
      };
    }

    const result = await sendTelegram(env, user.telegram_id, text, keyboard);
    if (!result.ok) {
      const attempts = job.attempt_count + 1;
      if (result.permanent || attempts >= MAX_ATTEMPTS) {
        await env.DB.prepare(
          `UPDATE reminder_jobs SET status='failed', attempt_count=?, error_code=?, locked_at=NULL WHERE id=?`,
        )
          .bind(attempts, result.code.slice(0, 120), job.id)
          .run();
      } else {
        const backoffMin = Math.min(60, 2 ** attempts);
        const retryDue = new Date(Date.now() + backoffMin * 60_000).toISOString();
        await env.DB.prepare(
          `UPDATE reminder_jobs SET status='pending', attempt_count=?, due_at_utc=?, error_code=?, locked_at=NULL WHERE id=?`,
        )
          .bind(attempts, retryDue, result.code.slice(0, 120), job.id)
          .run();
      }
      failed++;
      continue;
    }

    await env.DB.prepare(
      `UPDATE reminder_jobs SET status='sent', sent_at=?, telegram_message_id=?, locked_at=NULL, error_code=NULL WHERE id=?`,
    )
      .bind(nowIso(), result.messageId ?? null, job.id)
      .run();

    if (occ.status === "scheduled" || occ.status === "due" || occ.status === "snoozed") {
      await env.DB.prepare(`UPDATE activity_occurrences SET status='notified', updated_at=? WHERE id=? AND status IN ('scheduled','due','snoozed')`)
        .bind(nowIso(), occ.id)
        .run();
    }

    // next policy step
    const next = await env.DB.prepare(
      `SELECT step_number, delay_minutes FROM reminder_policy_steps WHERE policy_id=? AND step_number>? ORDER BY step_number ASC LIMIT 1`,
    )
      .bind(job.policy_id, job.step_number)
      .first<{ step_number: number; delay_minutes: number | null }>();

    if (next && next.delay_minutes != null && job.step_number < 90) {
      const policy = await env.DB.prepare(`SELECT max_messages FROM reminder_policies WHERE id=?`).bind(job.policy_id).first<{ max_messages: number }>();
      if (policy && next.step_number <= policy.max_messages) {
        const nextDue = new Date(Date.now() + next.delay_minutes * 60_000).toISOString();
        const key = `${occ.id}:${next.step_number}:${nextDue}`;
        await env.DB.prepare(
          `INSERT OR IGNORE INTO reminder_jobs (id,occurrence_id,user_id,policy_id,step_number,due_at_utc,status,attempt_count,locked_at,sent_at,telegram_message_id,idempotency_key,error_code,created_at)
           VALUES (?,?,?,?,?,?, 'pending', 0, NULL, NULL, NULL, ?, NULL, ?)`,
        )
          .bind(generateId(), occ.id, job.user_id, job.policy_id, next.step_number, nextDue, key, nowIso())
          .run();
      }
    }

    sent++;
  }

  console.log(JSON.stringify({ event: "telegram.delivery.batch", claimed, sent, failed, skipped, at: now }));
  return { claimed, sent, failed, skipped };
}
