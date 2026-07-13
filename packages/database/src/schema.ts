import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Schema conventions (E1-D1-T04, approved 2026-07-13):
 * - Primary keys: text (UUIDv7, generated app-side). D1/SQLite has no native UUID function.
 * - Timestamps (*_at, created_at, updated_at, expires_at): text ISO-8601 UTC.
 * - Local dates: text "YYYY-MM-DD". Local times: text "HH:MM".
 * - Booleans: integer 0/1 via drizzle { mode: "boolean" }.
 * - Enums: text + app-side Zod validation (SQLite has no enum type).
 * - Foreign keys: declared references + onDelete; D1 enforces only with PRAGMA foreign_keys=ON.
 *
 * Nullability/types contract per column: DEC-027.
 *
 * Scope: foundation entities only (users, user_settings, auth_sessions).
 * Remaining 28 tables are added per stage (workouts→2, programs/reminder_jobs→3, habits→4, social→7).
 * Field lists follow PRD §43.1–43.3 verbatim; PRD does not specify SQL types.
 */

// §43.1 users
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  photoUrl: text("photo_url"),
  timezone: text("timezone").notNull(),
  // 0–6, 0 = Sunday (JS Date.getDay() convention); value contract finalized in E1-D1-T10.
  weekStartsOn: integer("week_starts_on").notNull(),
  locale: text("locale").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

// §43.2 user_settings (1:1 with users)
export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  quietHoursStart: text("quiet_hours_start"),
  quietHoursEnd: text("quiet_hours_end"),
  quietHoursBehavior: text("quiet_hours_behavior"),
  // FK to reminder_policies added in stage 3 (table does not exist yet).
  defaultReminderPolicyId: text("default_reminder_policy_id"),
  weeklyReportEnabled: integer("weekly_report_enabled", { mode: "boolean" }).notNull(),
  // 0–6, 0 = Sunday; nullable when weekly report disabled.
  weeklyReportDay: integer("weekly_report_day"),
  weeklyReportTime: text("weekly_report_time"),
  monthlyReportEnabled: integer("monthly_report_enabled", { mode: "boolean" }).notNull(),
  friendNotificationsEnabled: integer("friend_notifications_enabled", { mode: "boolean" }).notNull(),
  partnerRemindersEnabled: integer("partner_reminders_enabled", { mode: "boolean" }).notNull(),
});

// §43.3 auth_sessions
export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    lastUsedAt: text("last_used_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash)],
);
