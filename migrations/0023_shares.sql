-- E7-D8-T02 object shares + revoke (PRD §43.11, §43.18, §33.3)
CREATE TABLE `workout_shares` (
	`workout_id` text NOT NULL,
	`shared_by_user_id` text NOT NULL,
	`shared_with_user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`revoked_at` text,
	PRIMARY KEY(`workout_id`, `shared_with_user_id`),
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shared_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shared_with_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_shares_with_idx` ON `workout_shares` (`shared_with_user_id`);
--> statement-breakpoint
CREATE INDEX `workout_shares_by_idx` ON `workout_shares` (`shared_by_user_id`);
--> statement-breakpoint
CREATE TABLE `habit_shares` (
	`habit_id` text NOT NULL,
	`shared_with_user_id` text NOT NULL,
	`show_streak` integer NOT NULL,
	`show_history` integer NOT NULL,
	`created_at` text NOT NULL,
	`revoked_at` text,
	PRIMARY KEY(`habit_id`, `shared_with_user_id`),
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shared_with_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `habit_shares_with_idx` ON `habit_shares` (`shared_with_user_id`);
