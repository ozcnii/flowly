CREATE TABLE `youtube_search_cache` (
	`cache_key` text PRIMARY KEY NOT NULL,
	`query_json` text NOT NULL,
	`results_json` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `youtube_search_cache_expires_at_idx` ON `youtube_search_cache` (`expires_at`);