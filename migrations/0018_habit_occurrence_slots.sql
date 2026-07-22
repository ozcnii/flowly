DROP INDEX `activity_occurrences_user_entity_date_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_occurrences_user_entity_date_unique` ON `activity_occurrences` (`user_id`,`entity_type`,`entity_id`,`scheduled_local_date`,`scheduled_local_time`);
