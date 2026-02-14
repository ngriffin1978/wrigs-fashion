import { mysqlTable, varchar, text, timestamp, int, json, boolean, float, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// User table - matches Better Auth requirements
export const users = mysqlTable('users', {
	id: varchar('id', { length: 255 }).primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	password: varchar('password', { length: 255 }),
	name: varchar('name', { length: 100 }).notNull(),
	image: varchar('image', { length: 500 }), // Better Auth uses 'image' not 'avatarUrl'
	role: varchar('role', { length: 20 }).notNull().default('user'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// Design table - user's fashion sketches
export const designs = mysqlTable('designs', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 200 }).notNull(),
	originalImageUrl: varchar('original_image_url', { length: 500 }),
	cleanedImageUrl: varchar('cleaned_image_url', { length: 500 }),
	coloredOverlayUrl: varchar('colored_overlay_url', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// DollTemplate table - paper doll base templates
export const dollTemplates = mysqlTable('doll_templates', {
	id: varchar('id', { length: 255 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	pose: varchar('pose', { length: 100 }).notNull(),
	baseImageUrl: varchar('base_image_url', { length: 500 }).notNull(),
	printableBasePdfUrl: varchar('printable_base_pdf_url', { length: 500 }),
	regions: json('regions').$type<{
		topRegion?: { x: number; y: number; width: number; height: number };
		bottomRegion?: { x: number; y: number; width: number; height: number };
		fullBodyRegion?: { x: number; y: number; width: number; height: number };
		[key: string]: { x: number; y: number; width: number; height: number } | undefined;
	}>().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// DollProject table - generated printable paper dolls
export const dollProjects = mysqlTable('doll_projects', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	designId: varchar('design_id', { length: 255 })
		.notNull()
		.references(() => designs.id, { onDelete: 'cascade' }),
	dollTemplateId: varchar('doll_template_id', { length: 255 })
		.notNull()
		.references(() => dollTemplates.id, { onDelete: 'restrict' }),
	pieces: json('pieces').$type<{
		category: string;
		region: string;
		scale: number;
		position: { x: number; y: number };
	}[]>().notNull(),
	pdfUrl: varchar('pdf_url', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Circle table - invite-only sharing groups
export const circles = mysqlTable('circles', {
	id: varchar('id', { length: 255 }).primaryKey(),
	ownerId: varchar('owner_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// CircleMember table - members in circles
export const circleMembers = mysqlTable('circle_members', {
	id: varchar('id', { length: 255 }).primaryKey(),
	circleId: varchar('circle_id', { length: 255 })
		.notNull()
		.references(() => circles.id, { onDelete: 'cascade' }),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	role: varchar('role', { length: 20 }).notNull().default('member'), // 'owner' or 'member'
	joinedAt: timestamp('joined_at').notNull().defaultNow()
});

// SharedItem table - items shared to circles
export const sharedItems = mysqlTable('shared_items', {
	id: varchar('id', { length: 255 }).primaryKey(),
	circleId: varchar('circle_id', { length: 255 })
		.notNull()
		.references(() => circles.id, { onDelete: 'cascade' }),
	itemType: varchar('item_type', { length: 20 }).notNull(), // 'design' or 'dollProject'
	itemId: varchar('item_id', { length: 255 }).notNull(), // references designs.id or dollProjects.id
	sharedBy: varchar('shared_by', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Reaction table - emoji reactions on shared items
export const reactions = mysqlTable('reactions', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	sharedItemId: varchar('shared_item_id', { length: 255 })
		.notNull()
		.references(() => sharedItems.id, { onDelete: 'cascade' }),
	reactionType: varchar('reaction_type', { length: 20 }).notNull(), // 'heart', 'star', 'paint', 'sparkle'
	createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
	// Unique constraint to prevent duplicate reactions - enables toggle behavior
	uniqueUserReaction: uniqueIndex('unique_user_reaction').on(table.userId, table.sharedItemId, table.reactionType)
}));

// Compliment table - preset compliments on shared items
export const compliments = mysqlTable('compliments', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	sharedItemId: varchar('shared_item_id', { length: 255 })
		.notNull()
		.references(() => sharedItems.id, { onDelete: 'cascade' }),
	complimentType: varchar('compliment_type', { length: 50 }).notNull(), // 'so_creative', 'love_it', 'amazing'
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Session table - Better Auth session management
export const sessions = mysqlTable('sessions', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull(),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent'),
	token: varchar('token', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Account table - for OAuth providers (future: Google, etc.)
export const accounts = mysqlTable('accounts', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	accountId: varchar('account_id', { length: 255 }).notNull(),
	providerId: varchar('provider_id', { length: 50 }).notNull(),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	expiresAt: timestamp('expires_at'),
	password: varchar('password', { length: 255 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// Verification table - email verification tokens (optional V1)
export const verifications = mysqlTable('verifications', {
	id: varchar('id', { length: 255 }).primaryKey(),
	identifier: varchar('identifier', { length: 255 }).notNull(),
	value: varchar('value', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Catalog table - fashion catalogs (collections of designs on a canvas)
export const catalogs = mysqlTable('catalogs', {
	id: varchar('id', { length: 255 }).primaryKey(),
	sessionId: varchar('session_id', { length: 255 }),
	userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 200 }).notNull().default('My Fashion Catalog'),
	shareSlug: varchar('share_slug', { length: 20 }).unique(),
	isPublic: boolean('is_public').notNull().default(false),
	backgroundColor: varchar('background_color', { length: 20 }).notNull().default('#ffffff'),
	backgroundPattern: varchar('background_pattern', { length: 50 }).default('none'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// CatalogItem table - individual images placed on a catalog canvas
export const catalogItems = mysqlTable('catalog_items', {
	id: varchar('id', { length: 255 }).primaryKey(),
	catalogId: varchar('catalog_id', { length: 255 })
		.notNull()
		.references(() => catalogs.id, { onDelete: 'cascade' }),
	imageUrl: varchar('image_url', { length: 500 }).notNull(),
	positionX: float('position_x').notNull().default(100),
	positionY: float('position_y').notNull().default(100),
	width: float('width').notNull().default(200),
	height: float('height').notNull().default(200),
	rotation: float('rotation').notNull().default(0),
	zIndex: int('z_index').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Define relations for better TypeScript inference
export const usersRelations = relations(users, ({ many }) => ({
	designs: many(designs),
	dollProjects: many(dollProjects),
	ownedCircles: many(circles),
	circleMemberships: many(circleMembers),
	sharedItems: many(sharedItems),
	reactions: many(reactions),
	compliments: many(compliments),
	sessions: many(sessions),
	accounts: many(accounts),
	catalogs: many(catalogs)
}));

export const designsRelations = relations(designs, ({ one, many }) => ({
	user: one(users, {
		fields: [designs.userId],
		references: [users.id]
	}),
	dollProjects: many(dollProjects)
}));

export const dollTemplatesRelations = relations(dollTemplates, ({ many }) => ({
	dollProjects: many(dollProjects)
}));

export const dollProjectsRelations = relations(dollProjects, ({ one }) => ({
	user: one(users, {
		fields: [dollProjects.userId],
		references: [users.id]
	}),
	design: one(designs, {
		fields: [dollProjects.designId],
		references: [designs.id]
	}),
	dollTemplate: one(dollTemplates, {
		fields: [dollProjects.dollTemplateId],
		references: [dollTemplates.id]
	})
}));

export const circlesRelations = relations(circles, ({ one, many }) => ({
	owner: one(users, {
		fields: [circles.ownerId],
		references: [users.id]
	}),
	members: many(circleMembers),
	sharedItems: many(sharedItems)
}));

export const circleMembersRelations = relations(circleMembers, ({ one }) => ({
	circle: one(circles, {
		fields: [circleMembers.circleId],
		references: [circles.id]
	}),
	user: one(users, {
		fields: [circleMembers.userId],
		references: [users.id]
	})
}));

export const sharedItemsRelations = relations(sharedItems, ({ one, many }) => ({
	circle: one(circles, {
		fields: [sharedItems.circleId],
		references: [circles.id]
	}),
	sharedByUser: one(users, {
		fields: [sharedItems.sharedBy],
		references: [users.id]
	}),
	reactions: many(reactions),
	compliments: many(compliments)
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
	user: one(users, {
		fields: [reactions.userId],
		references: [users.id]
	}),
	sharedItem: one(sharedItems, {
		fields: [reactions.sharedItemId],
		references: [sharedItems.id]
	})
}));

export const complimentsRelations = relations(compliments, ({ one }) => ({
	user: one(users, {
		fields: [compliments.userId],
		references: [users.id]
	}),
	sharedItem: one(sharedItems, {
		fields: [compliments.sharedItemId],
		references: [sharedItems.id]
	})
}));

export const catalogsRelations = relations(catalogs, ({ one, many }) => ({
	items: many(catalogItems),
	user: one(users, {
		fields: [catalogs.userId],
		references: [users.id]
	})
}));

export const catalogItemsRelations = relations(catalogItems, ({ one }) => ({
	catalog: one(catalogs, {
		fields: [catalogItems.catalogId],
		references: [catalogs.id]
	})
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	})
}));
