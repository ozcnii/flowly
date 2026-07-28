-- E8-D9-T03/T04: user data lifecycle + ops backup/alert state
CREATE TABLE `system_backups` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`table_count` integer NOT NULL,
	`storage_key` text,
	`status` text NOT NULL,
	`error` text,
	`payload` text
);
--> statement-breakpoint
CREATE INDEX `system_backups_created_at_idx` ON `system_backups` (`created_at`);
--> statement-breakpoint
CREATE TABLE `ops_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_export_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`completed_at` text,
	`size_bytes` integer,
	`error` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_export_jobs_user_idx` ON `user_export_jobs` (`user_id`);
