# Database Usage Guide

Quick reference for working with the database in Wrigs Fashion.

## Import

```typescript
import { db, schema } from '$lib/server/db';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
```

## Common Queries

### Users

```typescript
// Get user by ID
const user = await db.query.users.findFirst({
	where: eq(schema.users.id, userId)
});

// Get user by email
const user = await db.query.users.findFirst({
	where: eq(schema.users.email, email)
});

// Create new user
await db.insert(schema.users).values({
	id: nanoid(),
	email: 'user@example.com',
	nickname: 'CoolDesigner'
});
```

### Designs

```typescript
// Get all designs for user
const designs = await db.query.designs.findMany({
	where: eq(schema.designs.userId, userId),
	orderBy: desc(schema.designs.createdAt)
});

// Get design with user info
const design = await db.query.designs.findFirst({
	where: eq(schema.designs.id, designId),
	with: {
		user: true
	}
});

// Create new design
await db.insert(schema.designs).values({
	id: nanoid(),
	userId: userId,
	title: 'My Design',
	originalImageUrl: 'https://...'
});

// Update design
await db
	.update(schema.designs)
	.set({
		cleanedImageUrl: 'https://...',
		updatedAt: new Date()
	})
	.where(eq(schema.designs.id, designId));

// Delete design
await db.delete(schema.designs).where(eq(schema.designs.id, designId));
```

### Circles

```typescript
// Get user's circles
const circles = await db.query.circleMembers.findMany({
	where: eq(schema.circleMembers.userId, userId),
	with: {
		circle: {
			with: {
				owner: true
			}
		}
	}
});

// Create circle
const inviteCode = nanoid(8); // 8 character code
await db.insert(schema.circles).values({
	id: nanoid(),
	ownerId: userId,
	name: 'My Friends',
	inviteCode: inviteCode
});

// Add member to circle
await db.insert(schema.circleMembers).values({
	id: nanoid(),
	circleId: circleId,
	userId: userId,
	role: 'member'
});

// Find circle by invite code
const circle = await db.query.circles.findFirst({
	where: eq(schema.circles.inviteCode, inviteCode)
});
```

### Shared Items

```typescript
// Share design to circle
await db.insert(schema.sharedItems).values({
	id: nanoid(),
	circleId: circleId,
	itemType: 'design',
	itemId: designId,
	sharedBy: userId
});

// Get circle feed
const feed = await db.query.sharedItems.findMany({
	where: eq(schema.sharedItems.circleId, circleId),
	with: {
		sharedByUser: true,
		reactions: {
			with: {
				user: true
			}
		},
		compliments: {
			with: {
				user: true
			}
		}
	},
	orderBy: desc(schema.sharedItems.createdAt)
});
```

### Reactions & Compliments

```typescript
// Add reaction
await db.insert(schema.reactions).values({
	id: nanoid(),
	userId: userId,
	sharedItemId: sharedItemId,
	reactionType: 'heart' // 'heart', 'star', 'paint', 'sparkle'
});

// Add compliment
await db.insert(schema.compliments).values({
	id: nanoid(),
	userId: userId,
	sharedItemId: sharedItemId,
	complimentType: 'so_creative' // 'so_creative', 'love_it', 'amazing'
});

// Get reactions for shared item
const reactions = await db.query.reactions.findMany({
	where: eq(schema.reactions.sharedItemId, sharedItemId),
	with: {
		user: true
	}
});
```

### Doll Projects

```typescript
// Create doll project
await db.insert(schema.dollProjects).values({
	id: nanoid(),
	userId: userId,
	designId: designId,
	dollTemplateId: templateId,
	pieces: [
		{
			category: 'top',
			region: 'topRegion',
			scale: 1.0,
			position: { x: 0, y: 0 }
		}
	],
	pdfUrl: 'https://...'
});

// Get user's doll projects
const dollProjects = await db.query.dollProjects.findMany({
	where: eq(schema.dollProjects.userId, userId),
	with: {
		design: true,
		dollTemplate: true
	},
	orderBy: desc(schema.dollProjects.createdAt)
});
```

## TypeScript Types

Drizzle automatically generates types from schema:

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, designs, circles } from '$lib/server/db/schema';

// Select types (what you get from queries)
type User = InferSelectModel<typeof users>;
type Design = InferSelectModel<typeof designs>;
type Circle = InferSelectModel<typeof circles>;

// Insert types (what you pass to .insert())
type NewUser = InferInsertModel<typeof users>;
type NewDesign = InferInsertModel<typeof designs>;
type NewCircle = InferInsertModel<typeof circles>;
```

## Transactions

```typescript
// Run multiple operations in a transaction
await db.transaction(async (tx) => {
	// Create circle
	const circleId = nanoid();
	await tx.insert(schema.circles).values({
		id: circleId,
		ownerId: userId,
		name: 'My Circle',
		inviteCode: nanoid(8)
	});

	// Add owner as member
	await tx.insert(schema.circleMembers).values({
		id: nanoid(),
		circleId: circleId,
		userId: userId,
		role: 'owner'
	});
});
```

## Error Handling

```typescript
try {
	await db.insert(schema.users).values({
		id: nanoid(),
		email: 'existing@example.com', // duplicate email
		nickname: 'Test'
	});
} catch (error) {
	if (error.code === 'ER_DUP_ENTRY') {
		// Handle duplicate entry
		console.error('Email already exists');
	}
	throw error;
}
```

## See Also

- [DATABASE.md](../../../../DATABASE.md) - Full schema documentation
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
