-- §43.16 habits (stage 4: E4-D5-T02)
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`start_local_date` text NOT NULL,
	`end_local_date` text,
	`allow_skip` integer NOT NULL DEFAULT true,
	`allow_rest` integer NOT NULL DEFAULT false,
	`comment_enabled` integer NOT NULL DEFAULT true,
	`status` text NOT NULL DEFAULT 'active',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `habits_owner_status_idx` ON `habits` (`owner_id`, `status`);
