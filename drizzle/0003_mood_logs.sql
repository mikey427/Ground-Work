CREATE TABLE `mood_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`rating` integer NOT NULL,
	`note` text,
	`created_at` text NOT NULL
);

CREATE UNIQUE INDEX `mood_logs_date_unique` ON `mood_logs` (`date`);

