CREATE TABLE `habit_schedule_rules` (
  `id` text PRIMARY KEY NOT NULL,
  `habit_id` text NOT NULL,
  `rule_type` text NOT NULL,
  `timezone` text NOT NULL,
  `configuration_json` text NOT NULL,
  `valid_from` text NOT NULL,
  `valid_until` text,
  `created_at` text NOT NULL,
  FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `habit_schedule_rules_habit_idx` ON `habit_schedule_rules` (`habit_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `habit_schedule_rules_habit_current_unique` ON `habit_schedule_rules` (`habit_id`,`valid_until`);
