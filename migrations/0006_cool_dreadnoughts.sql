CREATE TABLE `activity_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`parent_entity_id` text,
	`scheduled_local_date` text NOT NULL,
	`scheduled_local_time` text NOT NULL,
	`timezone` text NOT NULL,
	`scheduled_at_utc` text NOT NULL,
	`status` text NOT NULL,
	`completed_at` text,
	`duration_seconds` integer NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `activity_occurrences_user_date_idx` ON `activity_occurrences` (`user_id`,`scheduled_local_date`);--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`occurrence_id` text NOT NULL,
	`old_status` text,
	`new_status` text NOT NULL,
	`changed_by_user_id` text NOT NULL,
	`source` text NOT NULL,
	`comment` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`occurrence_id`) REFERENCES `activity_occurrences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`changed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `status_history_occurrence_idx` ON `status_history` (`occurrence_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`occurrence_id` text,
	`state` text NOT NULL,
	`started_at` text NOT NULL,
	`paused_at` text,
	`accumulated_seconds` integer NOT NULL,
	`completed_at` text,
	`final_status` text,
	`current_exercise_position` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`occurrence_id`) REFERENCES `activity_occurrences`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_sessions_user_open_unique` ON `workout_sessions` (`user_id`) WHERE "workout_sessions"."state" = 'open';--> statement-breakpoint
CREATE INDEX `workout_sessions_user_state_idx` ON `workout_sessions` (`user_id`,`state`);--> statement-breakpoint
CREATE INDEX `workout_sessions_workout_idx` ON `workout_sessions` (`workout_id`);