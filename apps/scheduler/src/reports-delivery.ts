import { localDateInTimezone, nowIso } from "@flowly/core";

type Env = {
  DB: D1Database;
  WEB?: Fetcher;
  TELEGRAM_WEBHOOK_SECRET?: string;
  TELEGRAM_MODE?: string;
};

/** DEC-018: Monday 09:00 week report; 1st 09:00 month report — local user timezone. */
export async function deliverDueReports(env: Env): Promise<{ weekly: number; monthly: number }> {
  if (env.TELEGRAM_MODE === "mock" || !env.WEB || !env.TELEGRAM_WEBHOOK_SECRET) return { weekly: 0, monthly: 0 };
  const users = await env.DB.prepare(
    `SELECT u.id, u.telegram_id, u.timezone, s.weekly_report_enabled, s.monthly_report_enabled
     FROM users u JOIN user_settings s ON s.user_id = u.id
     WHERE u.deleted_at IS NULL`,
  ).all<{
    id: string;
    telegram_id: string;
    timezone: string;
    weekly_report_enabled: number;
    monthly_report_enabled: number;
  }>();

  let weekly = 0;
  let monthly = 0;
  const now = new Date();

  for (const user of users.results ?? []) {
    const local = localDateInTimezone(now, user.timezone || "UTC");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: user.timezone || "UTC",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const weekday = get("weekday"); // Mon
    const hour = Number(get("hour"));
    const minute = Number(get("minute"));
    const day = Number(get("day"));
    // Fire only in 09:00–09:01 local window (cron every minute).
    if (hour !== 9 || minute > 1) continue;

    if (user.weekly_report_enabled && weekday === "Mon") {
      const text = await weekSummary(env.DB, user.id, local);
      if (await send(env, user.telegram_id, `📊 Недельный отчёт Flowly\n${text}`)) weekly += 1;
    }
    if (user.monthly_report_enabled && day === 1) {
      const text = await monthSummary(env.DB, user.id, local);
      if (await send(env, user.telegram_id, `📊 Месячный отчёт Flowly\n${text}`)) monthly += 1;
    }
  }
  if (weekly || monthly) console.log(JSON.stringify({ event: "reports.delivered", weekly, monthly, at: nowIso() }));
  return { weekly, monthly };
}

async function weekSummary(db: D1Database, userId: string, today: string) {
  const row = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN status='completed' AND entity_type='workout' THEN 1 ELSE 0 END) AS workouts,
        SUM(CASE WHEN status='completed' AND entity_type='habit' THEN 1 ELSE 0 END) AS habits,
        SUM(CASE WHEN status='completed' THEN duration_seconds ELSE 0 END) AS seconds
       FROM activity_occurrences
       WHERE user_id=? AND scheduled_local_date >= date(?, '-6 days') AND scheduled_local_date <= ?`,
    )
    .bind(userId, today, today)
    .first<{ workouts: number; habits: number; seconds: number }>();
  return `Тренировки: ${row?.workouts ?? 0}\nПривычки: ${row?.habits ?? 0}\nВремя: ${Math.round((row?.seconds ?? 0) / 60)} мин\nОткройте Flowly → Календарь для деталей.`;
}

async function monthSummary(db: D1Database, userId: string, today: string) {
  const ym = today.slice(0, 7);
  const row = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN status='completed' AND entity_type='workout' THEN 1 ELSE 0 END) AS workouts,
        SUM(CASE WHEN status='completed' AND entity_type='habit' THEN 1 ELSE 0 END) AS habits,
        SUM(CASE WHEN status='completed' THEN duration_seconds ELSE 0 END) AS seconds
       FROM activity_occurrences
       WHERE user_id=? AND scheduled_local_date LIKE ?`,
    )
    .bind(userId, `${ym}%`)
    .first<{ workouts: number; habits: number; seconds: number }>();
  return `Тренировки: ${row?.workouts ?? 0}\nПривычки: ${row?.habits ?? 0}\nВремя: ${Math.round((row?.seconds ?? 0) / 60)} мин\nОткройте Flowly → Календарь.`;
}

async function send(env: Env, chatId: string, text: string) {
  try {
    const res = await env.WEB!.fetch(
      new Request("https://flowly-web.internal/api/v1/telegram/outbound", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET!,
        },
        body: JSON.stringify({ chat_id: chatId, text }),
      }),
    );
    return res.ok;
  } catch {
    return false;
  }
}
