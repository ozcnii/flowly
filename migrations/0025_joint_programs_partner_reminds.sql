-- E7-D8-T04 joint program shares + E7-D8-T07 partner remind log
CREATE TABLE `program_enrollment_shares` (
	`enrollment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`enrollment_id`, `user_id`),
	FOREIGN KEY (`enrollment_id`) REFERENCES `program_enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `program_enrollment_shares_user_idx` ON `program_enrollment_shares` (`user_id`);
--> statement-breakpoint
CREATE TABLE `partner_reminds` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `partner_reminds_pair_entity_idx` ON `partner_reminds` (`sender_id`, `recipient_id`, `entity_type`, `entity_id`, `created_at`);
