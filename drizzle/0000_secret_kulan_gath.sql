CREATE TABLE `accounts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(50) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_items` (
	`id` varchar(255) NOT NULL,
	`catalog_id` varchar(255) NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`position_x` float NOT NULL DEFAULT 100,
	`position_y` float NOT NULL DEFAULT 100,
	`width` float NOT NULL DEFAULT 200,
	`height` float NOT NULL DEFAULT 200,
	`rotation` float NOT NULL DEFAULT 0,
	`z_index` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalog_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalogs` (
	`id` varchar(255) NOT NULL,
	`session_id` varchar(255),
	`user_id` varchar(255),
	`title` varchar(200) NOT NULL DEFAULT 'My Fashion Catalog',
	`share_slug` varchar(20),
	`is_public` boolean NOT NULL DEFAULT false,
	`background_color` varchar(20) NOT NULL DEFAULT '#ffffff',
	`background_pattern` varchar(50) DEFAULT 'none',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogs_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogs_share_slug_unique` UNIQUE(`share_slug`)
);
--> statement-breakpoint
CREATE TABLE `circle_members` (
	`id` varchar(255) NOT NULL,
	`circle_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'member',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `circle_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `circles` (
	`id` varchar(255) NOT NULL,
	`owner_id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`invite_code` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `circles_id` PRIMARY KEY(`id`),
	CONSTRAINT `circles_invite_code_unique` UNIQUE(`invite_code`)
);
--> statement-breakpoint
CREATE TABLE `compliments` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`shared_item_id` varchar(255) NOT NULL,
	`compliment_type` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designs` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(200) NOT NULL,
	`original_image_url` varchar(500),
	`cleaned_image_url` varchar(500),
	`colored_overlay_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doll_projects` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`design_id` varchar(255) NOT NULL,
	`doll_template_id` varchar(255) NOT NULL,
	`pieces` json NOT NULL,
	`pdf_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doll_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doll_templates` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`pose` varchar(100) NOT NULL,
	`base_image_url` varchar(500) NOT NULL,
	`printable_base_pdf_url` varchar(500),
	`regions` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doll_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`shared_item_id` varchar(255) NOT NULL,
	`reaction_type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_items` (
	`id` varchar(255) NOT NULL,
	`circle_id` varchar(255) NOT NULL,
	`item_type` varchar(20) NOT NULL,
	`item_id` varchar(255) NOT NULL,
	`shared_by` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`password` varchar(255),
	`nickname` varchar(100) NOT NULL,
	`avatar_url` varchar(500),
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalog_items` ADD CONSTRAINT `catalog_items_catalog_id_catalogs_id_fk` FOREIGN KEY (`catalog_id`) REFERENCES `catalogs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalogs` ADD CONSTRAINT `catalogs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `circle_members` ADD CONSTRAINT `circle_members_circle_id_circles_id_fk` FOREIGN KEY (`circle_id`) REFERENCES `circles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `circle_members` ADD CONSTRAINT `circle_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `circles` ADD CONSTRAINT `circles_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliments` ADD CONSTRAINT `compliments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliments` ADD CONSTRAINT `compliments_shared_item_id_shared_items_id_fk` FOREIGN KEY (`shared_item_id`) REFERENCES `shared_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `designs` ADD CONSTRAINT `designs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doll_projects` ADD CONSTRAINT `doll_projects_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doll_projects` ADD CONSTRAINT `doll_projects_design_id_designs_id_fk` FOREIGN KEY (`design_id`) REFERENCES `designs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doll_projects` ADD CONSTRAINT `doll_projects_doll_template_id_doll_templates_id_fk` FOREIGN KEY (`doll_template_id`) REFERENCES `doll_templates`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reactions` ADD CONSTRAINT `reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reactions` ADD CONSTRAINT `reactions_shared_item_id_shared_items_id_fk` FOREIGN KEY (`shared_item_id`) REFERENCES `shared_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_items` ADD CONSTRAINT `shared_items_circle_id_circles_id_fk` FOREIGN KEY (`circle_id`) REFERENCES `circles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_items` ADD CONSTRAINT `shared_items_shared_by_users_id_fk` FOREIGN KEY (`shared_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;