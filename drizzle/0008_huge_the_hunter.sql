CREATE TABLE `token_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`game_iteration_id` integer,
	`model` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_iteration_id`) REFERENCES `game_iteration`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `token_usage_message_id_unique` ON `token_usage` (`message_id`);--> statement-breakpoint
CREATE INDEX `token_usage_user_id_idx` ON `token_usage` (`user_id`);