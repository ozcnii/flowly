CREATE TABLE `reminder_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`max_messages` integer NOT NULL,
	`last_message_local_time` text,
	`quiet_hours_behavior` text,
	`allow_custom_snooze` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `reminder_policy_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`delay_minutes` integer NOT NULL,
	`message_type` text NOT NULL,
	FOREIGN KEY (`policy_id`) REFERENCES `reminder_policies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reminder_policy_steps_policy_step_unique` ON `reminder_policy_steps` (`policy_id`,`step_number`);
--> statement-breakpoint
CREATE TABLE `reminder_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`occurrence_id` text NOT NULL,
	`user_id` text NOT NULL,
	`policy_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`due_at_utc` text NOT NULL,
	`status` text NOT NULL,
	`attempt_count` integer NOT NULL,
	`locked_at` text,
	`sent_at` text,
	`telegram_message_id` text,
	`idempotency_key` text NOT NULL,
	`error_code` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`occurrence_id`) REFERENCES `activity_occurrences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`policy_id`) REFERENCES `reminder_policies`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reminder_jobs_idempotency_unique` ON `reminder_jobs` (`idempotency_key`);
--> statement-breakpoint
CREATE INDEX `reminder_jobs_status_due_idx` ON `reminder_jobs` (`status`,`due_at_utc`);
--> statement-breakpoint
CREATE INDEX `reminder_jobs_occurrence_idx` ON `reminder_jobs` (`occurrence_id`);
--> statement-breakpoint
-- System program policy (DEC-001: jobs only; Telegram delivery = stage 5)
INSERT INTO `reminder_policies` (`id`,`owner_id`,`name`,`type`,`max_messages`,`last_message_local_time`,`quiet_hours_behavior`,`allow_custom_snooze`,`created_at`)
VALUES ('rp-program-default',NULL,'Программа · по умолчанию','program',3,'21:00','defer',1,'2026-07-13T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO `reminder_policy_steps` (`id`,`policy_id`,`step_number`,`delay_minutes`,`message_type`) VALUES
	('rps-program-default-1','rp-program-default',1,0,'primary'),
	('rps-program-default-2','rp-program-default',2,60,'repeat'),
	('rps-program-default-3','rp-program-default',3,180,'final');
