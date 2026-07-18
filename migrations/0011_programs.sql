CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_object_key` text,
	`duration_days` integer NOT NULL,
	`category` text NOT NULL,
	`is_system` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `program_days` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`type` text NOT NULL,
	`workout_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_days_program_day_unique` ON `program_days` (`program_id`,`day_number`);
