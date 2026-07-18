import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
 * Scope grows by stage. E1 foundation: users, user_settings, auth_sessions.
 * E2 catalog/runtime: workout_categories, workouts, workout_category_links, exercises,
 * workout_exercises, activity_occurrences, workout_sessions, status_history.
 * Remaining tables are added per stage (programs/reminder_jobs→3, habits→4, social→7).
 * Field lists follow PRD §43 verbatim; PRD does not specify SQL types.
 */

// §43.1 users
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  timezone: text("timezone").notNull(),
  // Fixed product invariant: Monday (1, JS Date.getDay() convention), DEC-042.
  weekStartsOn: integer("week_starts_on").notNull(),
  locale: text("locale").notNull(),
  onboardingCompletedAt: text("onboarding_completed_at"),
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

// §43.6 workout_categories
export const workoutCategories = sqliteTable(
  "workout_categories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    sortOrder: integer("sort_order").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
  },
  (table) => [uniqueIndex("workout_categories_slug_unique").on(table.slug)],
);

// §43.7 workouts
export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").references(() => users.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  visibility: text("visibility").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverObjectKey: text("cover_object_key"),
  youtubeVideoId: text("youtube_video_id"),
  durationSeconds: integer("duration_seconds").notNull(),
  difficulty: text("difficulty").notNull(),
  equipment: text("equipment").notNull(),
  contraindications: text("contraindications").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
}, (table) => [uniqueIndex("workouts_owner_youtube_video_unique").on(table.ownerId, table.sourceType, table.youtubeVideoId).where(sql`${table.ownerId} IS NOT NULL AND ${table.sourceType} = 'youtube' AND ${table.youtubeVideoId} IS NOT NULL`)]);

// §43.8 workout_category_links
export const workoutCategoryLinks = sqliteTable(
  "workout_category_links",
  {
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => workoutCategories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.workoutId, table.categoryId] })],
);

// §43.9 exercises
export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mediaObjectKey: text("media_object_key"),
  mediaType: text("media_type"),
  defaultDurationSeconds: integer("default_duration_seconds"),
  defaultRepetitions: integer("default_repetitions"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// §43.10 workout_exercises
export const workoutExercises = sqliteTable(
  "workout_exercises",
  {
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    setsCount: integer("sets_count"),
    repetitions: integer("repetitions"),
    durationSeconds: integer("duration_seconds"),
    restSeconds: integer("rest_seconds"),
    customInstruction: text("custom_instruction"),
  },
  (table) => [primaryKey({ columns: [table.workoutId, table.position] })],
);

// §43.21 activity_occurrences
export const activityOccurrences = sqliteTable(
  "activity_occurrences",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    parentEntityId: text("parent_entity_id"),
    scheduledLocalDate: text("scheduled_local_date").notNull(),
    scheduledLocalTime: text("scheduled_local_time").notNull(),
    timezone: text("timezone").notNull(),
    scheduledAtUtc: text("scheduled_at_utc").notNull(),
    status: text("status").notNull(),
    completedAt: text("completed_at"),
    durationSeconds: integer("duration_seconds").notNull(),
    source: text("source").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("activity_occurrences_user_date_idx").on(table.userId, table.scheduledLocalDate)],
);

// §43.23 workout_sessions
export const workoutSessions = sqliteTable(
  "workout_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    workoutId: text("workout_id").notNull().references(() => workouts.id, { onDelete: "restrict" }),
    occurrenceId: text("occurrence_id").references(() => activityOccurrences.id, { onDelete: "set null" }),
    state: text("state").notNull(),
    startedAt: text("started_at").notNull(),
    pausedAt: text("paused_at"),
    accumulatedSeconds: integer("accumulated_seconds").notNull(),
    playbackPositionSeconds: integer("playback_position_seconds").notNull().default(0),
    completedAt: text("completed_at"),
    finalStatus: text("final_status"),
    currentExercisePosition: integer("current_exercise_position"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("workout_sessions_user_open_unique").on(table.userId).where(sql`${table.state} = 'open'`),
    index("workout_sessions_user_state_idx").on(table.userId, table.state),
    index("workout_sessions_workout_idx").on(table.workoutId),
  ],
);

// §43.24 status_history
export const statusHistory = sqliteTable(
  "status_history",
  {
    id: text("id").primaryKey(),
    occurrenceId: text("occurrence_id").notNull().references(() => activityOccurrences.id, { onDelete: "cascade" }),
    oldStatus: text("old_status"),
    newStatus: text("new_status").notNull(),
    changedByUserId: text("changed_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    comment: text("comment"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("status_history_occurrence_idx").on(table.occurrenceId, table.createdAt)],
);

// §43.28 youtube_search_cache
export const youtubeSearchCache = sqliteTable(
  "youtube_search_cache",
  {
    cacheKey: text("cache_key").primaryKey(),
    queryJson: text("query_json").notNull(),
    resultsJson: text("results_json").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("youtube_search_cache_expires_at_idx").on(table.expiresAt)],
);
