-- PRD §43.31 processed_telegram_updates — Telegram webhook update_id journal (E5-D6-T01)
CREATE TABLE `processed_telegram_updates` (
	`update_id` integer PRIMARY KEY NOT NULL,
	`processed_at` text NOT NULL,
	`result_status` text NOT NULL
);
