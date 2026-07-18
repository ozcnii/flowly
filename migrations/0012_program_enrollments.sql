CREATE TABLE `program_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`user_id` text NOT NULL,
	`start_local_date` text NOT NULL,
	`reminder_policy_id` text,
	`reminder_local_time` text,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_enrollments_user_program_active_unique` ON `program_enrollments` (`user_id`,`program_id`) WHERE "program_enrollments"."status" = 'active';
--> statement-breakpoint
CREATE INDEX `program_enrollments_user_status_idx` ON `program_enrollments` (`user_id`,`status`);
