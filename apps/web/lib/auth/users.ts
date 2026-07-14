import { eq } from "drizzle-orm";
import type { Database } from "@flowly/database";
import { schema } from "@flowly/database";
import type { TelegramInitUser } from "@flowly/telegram";
import { generateId, nowIso } from "@flowly/core";

export interface PublicUser {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  timezone: string;
  weekStartsOn: number;
  locale: string;
}

export function publicUser(user: {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  timezone: string;
  weekStartsOn: number;
  locale: string;
}): PublicUser {
  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    timezone: user.timezone,
    weekStartsOn: user.weekStartsOn,
    locale: user.locale,
  };
}

export async function getUser(db: Database, userId: string) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  return rows[0] ?? null;
}

/**
 * Find an existing user by Telegram id, or create user + default settings.
 * Per DEC-020, Flowly name is edited separately from Telegram, so we do not
 * overwrite existing name fields on re-auth. Telegram username/avatar URL are refreshed;
 * onboarding (S-MA-003) lets the user refine timezone/locale/week start.
 */
export async function findOrCreateUser(
  db: Database,
  tg: TelegramInitUser,
): Promise<{ id: string; isNew: boolean }> {
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.telegramId, String(tg.id)))
    .limit(1);
  if (existing[0]) {
    await db
      .update(schema.users)
      .set({ username: tg.username ?? null, photoUrl: tg.photo_url ?? null, updatedAt: nowIso() })
      .where(eq(schema.users.id, existing[0].id));
    return { id: existing[0].id, isNew: false };
  }

  const id = generateId();
  const ts = nowIso();
  await db.insert(schema.users).values({
    id,
    telegramId: String(tg.id),
    username: tg.username ?? null,
    firstName: tg.first_name,
    lastName: tg.last_name ?? null,
    photoUrl: tg.photo_url ?? null,
    timezone: "UTC",
    weekStartsOn: 1,
    locale: tg.language_code ?? "ru",
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
  });
  await db.insert(schema.userSettings).values({
    userId: id,
    quietHoursStart: null,
    quietHoursEnd: null,
    quietHoursBehavior: null,
    defaultReminderPolicyId: null,
    weeklyReportEnabled: false,
    weeklyReportDay: null,
    weeklyReportTime: null,
    monthlyReportEnabled: false,
    friendNotificationsEnabled: false,
    partnerRemindersEnabled: false,
  });
  return { id, isNew: true };
}
