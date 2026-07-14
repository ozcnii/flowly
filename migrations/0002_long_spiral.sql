CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`media_object_key` text,
	`media_type` text,
	`default_duration_seconds` integer,
	`default_repetitions` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`sort_order` integer NOT NULL,
	`is_active` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_categories_slug_unique` ON `workout_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `workout_category_links` (
	`workout_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`workout_id`, `category_id`),
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `workout_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`sets_count` integer,
	`repetitions` integer,
	`duration_seconds` integer,
	`rest_seconds` integer,
	`custom_instruction` text,
	PRIMARY KEY(`workout_id`, `position`),
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`source_type` text NOT NULL,
	`visibility` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_object_key` text,
	`youtube_video_id` text,
	`duration_seconds` integer NOT NULL,
	`difficulty` text NOT NULL,
	`equipment` text NOT NULL,
	`contraindications` text NOT NULL,
	`format` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
