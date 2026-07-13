-- E1-D1-T08 foundation seed: test users + user_settings.
-- LOCAL D1 ONLY (applied via `wrangler d1 execute --local`). Production run is forbidden.
-- Idempotent via INSERT OR IGNORE (users.telegram_id UNIQUE, user_settings.user_id PK).
--
-- §49.5 full seed also covers workouts/programs/habits/history/joint challenge,
-- but those tables appear in stages 2–4. This file seeds foundation rows only;
-- entity rows are added by per-stage seeds when the tables exist.

INSERT OR IGNORE INTO users (
  id, telegram_id, username, first_name, last_name, photo_url,
  timezone, week_starts_on, locale, created_at, updated_at, deleted_at
) VALUES
  ('019f5dec-6000-7c02-9a8e-eae0fe6dd5de', '100000001', 'anna_flowly', 'Анна',  NULL, NULL, 'Europe/Moscow', 1, 'ru', '2026-07-14T00:00:00.000Z', '2026-07-14T00:00:00.000Z', NULL),
  ('019f5dfb-a240-7c6b-8e19-eb8f3adf1931', '100000002', 'mary_yoga',  'Мария',  NULL, NULL, 'Europe/Moscow', 1, 'ru', '2026-07-14T00:00:00.000Z', '2026-07-14T00:00:00.000Z', NULL),
  ('019f5e0a-e480-7acc-8fe1-10a10c2b67ee', '100000003', 'oleg_f',      'Олег',   NULL, NULL, 'Europe/Moscow', 1, 'ru', '2026-07-14T00:00:00.000Z', '2026-07-14T00:00:00.000Z', NULL),
  ('019f5e1a-26c0-7add-a800-f88399f4fe55', '100000004', 'igor_f',      'Игорь',  NULL, NULL, 'Europe/Moscow', 1, 'ru', '2026-07-14T00:00:00.000Z', '2026-07-14T00:00:00.000Z', NULL);

INSERT OR IGNORE INTO user_settings (
  user_id, quiet_hours_start, quiet_hours_end, quiet_hours_behavior,
  default_reminder_policy_id, weekly_report_enabled, weekly_report_day,
  weekly_report_time, monthly_report_enabled, friend_notifications_enabled,
  partner_reminders_enabled
) VALUES
  ('019f5dec-6000-7c02-9a8e-eae0fe6dd5de', NULL, NULL, NULL, NULL, 1, 1, '09:00', 1, 1, 1),
  ('019f5dfb-a240-7c6b-8e19-eb8f3adf1931', NULL, NULL, NULL, NULL, 1, 1, '09:00', 1, 1, 1),
  ('019f5e0a-e480-7acc-8fe1-10a10c2b67ee', NULL, NULL, NULL, NULL, 1, 1, '09:00', 1, 1, 1),
  ('019f5e1a-26c0-7add-a800-f88399f4fe55', NULL, NULL, NULL, NULL, 1, 1, '09:00', 1, 1, 1);
