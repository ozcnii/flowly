-- E7-D8-T01 friendships + invite_links (PRD §43.4–43.5)
CREATE TABLE `friendships` (
	`id` text PRIMARY KEY NOT NULL,
	`requester_id` text NOT NULL,
	`addressee_id` text,
	`status` text NOT NULL,
	`invite_code` text,
	`created_at` text NOT NULL,
	`accepted_at` text,
	`removed_at` text,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`addressee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `friendships_requester_idx` ON `friendships` (`requester_id`);
--> statement-breakpoint
CREATE INDEX `friendships_addressee_idx` ON `friendships` (`addressee_id`);
--> statement-breakpoint
CREATE INDEX `friendships_status_idx` ON `friendships` (`status`);
--> statement-breakpoint
CREATE TABLE `invite_links` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text NOT NULL,
	`max_uses` integer NOT NULL,
	`use_count` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invite_links_code_unique` ON `invite_links` (`code`);
--> statement-breakpoint
CREATE INDEX `invite_links_owner_idx` ON `invite_links` (`owner_id`);
