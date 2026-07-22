CREATE TABLE `reminder_policy_steps_new` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`delay_minutes` integer,
	`message_type` text NOT NULL,
	FOREIGN KEY (`policy_id`) REFERENCES `reminder_policies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `reminder_policy_steps_new` (`id`,`policy_id`,`step_number`,`delay_minutes`,`message_type`)
SELECT `id`,`policy_id`,`step_number`,`delay_minutes`,`message_type` FROM `reminder_policy_steps`;
--> statement-breakpoint
DROP TABLE `reminder_policy_steps`;
--> statement-breakpoint
ALTER TABLE `reminder_policy_steps_new` RENAME TO `reminder_policy_steps`;
--> statement-breakpoint
CREATE UNIQUE INDEX `reminder_policy_steps_policy_step_unique` ON `reminder_policy_steps` (`policy_id`,`step_number`);
--> statement-breakpoint
INSERT OR IGNORE INTO `reminder_policies` (`id`,`owner_id`,`name`,`type`,`max_messages`,`last_message_local_time`,`quiet_hours_behavior`,`allow_custom_snooze`,`created_at`) VALUES
	('rp-habit-gentle',NULL,'Бережная','gentle',2,NULL,'defer',1,'2026-07-21T00:00:00.000Z'),
	('rp-habit-normal',NULL,'Обычная','normal',3,NULL,'defer',1,'2026-07-21T00:00:00.000Z'),
	('rp-habit-persistent',NULL,'Настойчивая','persistent',5,NULL,'defer',1,'2026-07-21T00:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO `reminder_policy_steps` (`id`,`policy_id`,`step_number`,`delay_minutes`,`message_type`) VALUES
	('rps-habit-gentle-1','rp-habit-gentle',1,0,'primary'),
	('rps-habit-gentle-2','rp-habit-gentle',2,90,'repeat'),
	('rps-habit-normal-1','rp-habit-normal',1,0,'primary'),
	('rps-habit-normal-2','rp-habit-normal',2,45,'repeat'),
	('rps-habit-normal-3','rp-habit-normal',3,165,'final'),
	('rps-habit-persistent-1','rp-habit-persistent',1,0,'primary'),
	('rps-habit-persistent-2','rp-habit-persistent',2,30,'repeat'),
	('rps-habit-persistent-3','rp-habit-persistent',3,90,'repeat'),
	('rps-habit-persistent-4','rp-habit-persistent',4,210,'repeat'),
	('rps-habit-persistent-5','rp-habit-persistent',5,NULL,'final');
--> statement-breakpoint
ALTER TABLE `habits` ADD COLUMN `reminder_policy_id` text REFERENCES `reminder_policies`(`id`) ON UPDATE no action ON DELETE restrict;
--> statement-breakpoint
CREATE INDEX `habits_reminder_policy_idx` ON `habits` (`reminder_policy_id`);
--> statement-breakpoint
UPDATE `habits` SET `reminder_policy_id` = 'rp-habit-gentle' WHERE `reminder_policy_id` IS NULL;
