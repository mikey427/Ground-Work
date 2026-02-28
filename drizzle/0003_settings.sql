CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL DEFAULT 1,
	`yearly_goal` integer NOT NULL DEFAULT 12,
	`updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT OR IGNORE INTO `settings` (`id`, `yearly_goal`, `updated_at`) VALUES (1, 12, datetime('now'));
