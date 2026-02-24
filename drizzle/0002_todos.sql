CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`cadence` text NOT NULL DEFAULT 'daily',
	`recurring` integer NOT NULL DEFAULT 0,
	`due_at` text,
	`email_reminder` text NOT NULL DEFAULT '{"enabled":false,"when":"at_time"}',
	`completed` integer NOT NULL DEFAULT 0,
	`completed_at` text,
	`recurrence_detail` text,
	`created_at` text NOT NULL
);
