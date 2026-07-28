-- E7-D8-T05 challenges + members; E7-D8-T06 reactions (PRD §43.25–43.27)
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`goal_type` text NOT NULL,
	`goal_value` integer NOT NULL,
	`starts_on` text NOT NULL,
	`ends_on` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `challenges_owner_idx` ON `challenges` (`owner_id`);
--> statement-breakpoint
CREATE TABLE `challenge_members` (
	`challenge_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`joined_at` text NOT NULL,
	PRIMARY KEY(`challenge_id`, `user_id`),
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `challenge_members_user_idx` ON `challenge_members` (`user_id`);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`emoji` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reactions_entity_idx` ON `reactions` (`entity_type`, `entity_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `reactions_sender_entity_unique` ON `reactions` (`sender_id`, `entity_type`, `entity_id`);
