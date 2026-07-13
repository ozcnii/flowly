CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_used_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_sessions_token_hash_index` ON `auth_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`quiet_hours_start` text,
	`quiet_hours_end` text,
	`quiet_hours_behavior` text,
	`default_reminder_policy_id` text,
	`weekly_report_enabled` integer NOT NULL,
	`weekly_report_day` integer,
	`weekly_report_time` text,
	`monthly_report_enabled` integer NOT NULL,
	`friend_notifications_enabled` integer NOT NULL,
	`partner_reminders_enabled` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` text NOT NULL,
	`username` text,
	`first_name` text NOT NULL,
	`last_name` text,
	`photo_url` text,
	`timezone` text NOT NULL,
	`week_starts_on` integer NOT NULL,
	`locale` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);