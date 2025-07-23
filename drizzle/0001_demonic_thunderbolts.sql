CREATE TABLE `playlist` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlist_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` text NOT NULL,
	`video_id` text NOT NULL,
	`title` text,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlist`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`active_playlist_id` text,
	`loop_mode` text DEFAULT 'all' NOT NULL,
	`is_shuffle` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);