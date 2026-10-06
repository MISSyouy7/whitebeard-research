CREATE TABLE `mirror_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`suffix` text NOT NULL,
	`batch` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`claimed_by` text,
	`created_at` integer NOT NULL,
	`claimed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mirror_codes_hash_unique` ON `mirror_codes` (`hash`);--> statement-breakpoint
CREATE INDEX `mirror_codes_claimed_by` ON `mirror_codes` (`claimed_by`);--> statement-breakpoint
CREATE TABLE `mirror_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `mirror_limits_expiry` ON `mirror_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `mirror_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
