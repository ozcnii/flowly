import { nowIso } from "@flowly/core";

/** DEC-006 thresholds. */
export const ALERT = {
  schedulerFailStreak: 3,
  deliveryFailRatio: 0.5,
  deliveryFailMinClaimed: 10,
  deliveryFailAbsolute: 20,
  botFailStreak: 5,
  debounceMs: 60 * 60 * 1000,
} as const;

type Env = {
  DB: D1Database;
  WEB?: Fetcher;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_MODE?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  FLOWLY_OWNER_TELEGRAM_ID?: string;
};

async function getState(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare(`SELECT value FROM ops_state WHERE key=?`).bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

async function setState(db: D1Database, key: string, value: string) {
  const ts = nowIso();
  await db
    .prepare(
      `INSERT INTO ops_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
    )
    .bind(key, value, ts)
    .run();
}

/** Same send path as delivery: WEB service binding → web outbound proxy. */
async function sendOwner(env: Env, text: string): Promise<boolean> {
  const chatId = env.FLOWLY_OWNER_TELEGRAM_ID?.trim();
  if (!chatId) {
    console.log(JSON.stringify({ event: "owner.alert.skip", reason: "no_owner_id", text: text.slice(0, 120) }));
    return false;
  }
  const mode = (env.TELEGRAM_MODE || "production").toLowerCase();
  if (mode === "mock") {
    console.log(JSON.stringify({ event: "owner.alert.mock", chatId, text: text.slice(0, 200) }));
    return true;
  }

  if (env.WEB && env.TELEGRAM_WEBHOOK_SECRET) {
    try {
      const res = await env.WEB.fetch(
        new Request("https://flowly-web.internal/api/v1/telegram/outbound", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-telegram-bot-api-secret-token": env.TELEGRAM_WEBHOOK_SECRET,
            accept: "application/json",
          },
          body: JSON.stringify({ chat_id: chatId, text }),
        }),
      );
      const raw = await res.text();
      let body: { ok?: boolean; code?: string; error?: string } = {};
      try {
        body = JSON.parse(raw) as typeof body;
      } catch {
        body = {};
      }
      if (!res.ok || !body.ok) {
        console.log(JSON.stringify({ event: "owner.alert.proxy_fail", status: res.status, code: body.code || body.error || `http_${res.status}` }));
        return false;
      }
      return true;
    } catch (e) {
      console.log(JSON.stringify({ event: "owner.alert.proxy_error", error: e instanceof Error ? e.message : "proxy_network" }));
      return false;
    }
  }

  if (!env.TELEGRAM_BOT_TOKEN) {
    console.log(JSON.stringify({ event: "owner.alert.skip", reason: "no_token", text: text.slice(0, 120) }));
    return false;
  }
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    console.log(JSON.stringify({ event: "owner.alert.fail", status: res.status }));
    return false;
  }
  return true;
}

async function maybeNotify(env: Env, key: string, text: string) {
  const last = await getState(env.DB, `alert_sent:${key}`);
  if (last && Date.now() - Date.parse(last) < ALERT.debounceMs) return;
  const ok = await sendOwner(env, text);
  if (ok) await setState(env.DB, `alert_sent:${key}`, nowIso());
}

export async function recordSchedulerResult(env: Env, ok: boolean) {
  const prev = Number((await getState(env.DB, "scheduler_fail_streak")) ?? "0");
  const next = ok ? 0 : prev + 1;
  await setState(env.DB, "scheduler_fail_streak", String(next));
  if (!ok && next >= ALERT.schedulerFailStreak) {
    await maybeNotify(env, "scheduler_fail", `Flowly: scheduler fail streak ${next} (threshold ${ALERT.schedulerFailStreak}).`);
  }
}

export async function evaluateDeliveryBatch(env: Env, stats: { claimed: number; sent: number; failed: number; skipped: number }) {
  const { claimed, failed } = stats;
  const ratio = claimed > 0 ? failed / claimed : 0;
  if ((claimed >= ALERT.deliveryFailMinClaimed && ratio >= ALERT.deliveryFailRatio) || failed >= ALERT.deliveryFailAbsolute) {
    await maybeNotify(env, "delivery_fail", `Flowly: delivery batch failed=${failed} claimed=${claimed} ratio=${ratio.toFixed(2)}.`);
  }
  if (failed > 0 && stats.sent === 0 && claimed > 0) {
    const prev = Number((await getState(env.DB, "bot_fail_streak")) ?? "0");
    const next = prev + 1;
    await setState(env.DB, "bot_fail_streak", String(next));
    if (next >= ALERT.botFailStreak) await maybeNotify(env, "bot_fail", `Flowly: telegram send fail streak ${next}.`);
  } else if (stats.sent > 0) {
    await setState(env.DB, "bot_fail_streak", "0");
  }
}

export async function notifyBackupResult(env: Env, result: { ok: boolean; sizeBytes?: number; error?: string }) {
  if (result.ok) {
    await maybeNotify(env, "backup_ok", `Flowly: weekly backup OK (${result.sizeBytes ?? 0} bytes).`);
    return;
  }
  await maybeNotify(env, "backup_fail", `Flowly: weekly backup FAILED: ${result.error ?? "unknown"}`);
}
