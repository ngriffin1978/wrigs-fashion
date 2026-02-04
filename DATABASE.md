# Database Schema Documentation

This document describes the database schema for Wrigs Fashion using Drizzle ORM with MySQL.

## Overview

The database consists of 9 main tables:
- **users** - User accounts
- **designs** - Fashion sketch designs
- **doll_templates** - Paper doll base templates
- **doll_projects** - Generated paper dolls
- **circles** - Invite-only sharing groups
- **circle_members** - Circle membership
- **shared_items** - Items shared to circles
- **reactions** - Emoji reactions
- **compliments** - Preset compliments

## Schema Details

### Users Table

Stores user account information.

```typescript
users {
  id: string (PK)
  email: string (unique)
  nickname: string
  avatarUrl: string?
  createdAt: timestamp
}
```

**Relations:**
- Has many `designs`
- Has many `dollProjects`
- Owns many `circles`
- Has many `circleMemberships`

---

### Designs Table

Stores user's fashion sketches and their processed versions.

```typescript
designs {
  id: string (PK)
  userId: string (FK → users.id)
  title: string
  originalImageUrl: string?
  cleanedImageUrl: string?
  coloredOverlayUrl: string?
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Relations:**
- Belongs to `user`
- Has many `dollProjects`

**Image Processing Flow:**
1. `originalImageUrl` - Original uploaded photo
2. `cleanedImageUrl` - After background removal and line enhancement
3. `coloredOverlayUrl` - After coloring and patterns applied

---

### Doll Templates Table

Paper doll base templates with outfit placement regions.

```typescript
dollTemplates {
  id: string (PK)
  name: string
  pose: string
  baseImageUrl: string
  printableBasePdfUrl: string?
  regions: JSON
  createdAt: timestamp
}
```

**Regions JSON Structure:**
```typescript
{
  topRegion?: { x: number, y: number, width: number, height: number }
  bottomRegion?: { x: number, y: number, width: number, height: number }
  fullBodyRegion?: { x: number, y: number, width: number, height: number }
  // Custom regions possible
}
```

**Relations:**
- Has many `dollProjects`

---

### Doll Projects Table

Generated printable paper dolls combining templates and designs.

```typescript
dollProjects {
  id: string (PK)
  userId: string (FK → users.id)
  designId: string (FK → designs.id)
  dollTemplateId: string (FK → doll_templates.id)
  pieces: JSON
  pdfUrl: string?
  createdAt: timestamp
}
```

**Pieces JSON Structure:**
```typescript
[
  {
    category: string,      // 'top', 'bottom', 'dress', etc.
    region: string,        // 'topRegion', 'bottomRegion'
    scale: number,         // 0.5 - 2.0
    position: { x: number, y: number }
  }
]
```

**Relations:**
- Belongs to `user`
- Belongs to `design`
- Belongs to `dollTemplate`

---

### Circles Table

Invite-only sharing groups for safe sharing.

```typescript
circles {
  id: string (PK)
  ownerId: string (FK → users.id)
  name: string
  inviteCode: string (unique)
  createdAt: timestamp
}
```

**Relations:**
- Belongs to `owner` (user)
- Has many `members`
- Has many `sharedItems`

**Invite Code:** 6-8 character unique code for joining

---

### Circle Members Table

Membership in circles.

```typescript
circleMembers {
  id: string (PK)
  circleId: string (FK → circles.id)
  userId: string (FK → users.id)
  role: string              // 'owner' or 'member'
  joinedAt: timestamp
}
```

**Relations:**
- Belongs to `circle`
- Belongs to `user`

**Roles:**
- `owner` - Circle creator (can manage members)
- `member` - Regular member (can view and react)

---

### Shared Items Table

Items (designs or doll projects) shared to circles.

```typescript
sharedItems {
  id: string (PK)
  circleId: string (FK → circles.id)
  itemType: string          // 'design' or 'dollProject'
  itemId: string            // references designs.id or dollProjects.id
  sharedBy: string (FK → users.id)
  createdAt: timestamp
}
```

**Relations:**
- Belongs to `circle`
- Belongs to `sharedByUser`
- Has many `reactions`
- Has many `compliments`

**Item Types:**
- `design` - Fashion sketch design
- `dollProject` - Complete paper doll PDF

---

### Reactions Table

Emoji reactions on shared items (safety: no free text).

```typescript
reactions {
  id: string (PK)
  userId: string (FK → users.id)
  sharedItemId: string (FK → shared_items.id)
  reactionType: string      // 'heart', 'star', 'paint', 'sparkle'
  createdAt: timestamp
}
```

**Relations:**
- Belongs to `user`
- Belongs to `sharedItem`

**Reaction Types:**
- `heart` - ❤️ Love it!
- `star` - ⭐ Amazing!
- `paint` - 🎨 So creative!
- `sparkle` - ✨ Wow!

---

### Compliments Table

Preset compliments on shared items (safety: no free text).

```typescript
compliments {
  id: string (PK)
  userId: string (FK → users.id)
  sharedItemId: string (FK → shared_items.id)
  complimentType: string    // 'so_creative', 'love_it', 'amazing'
  createdAt: timestamp
}
```

**Relations:**
- Belongs to `user`
- Belongs to `sharedItem`

**Compliment Types:**
- `so_creative` - "So creative!"
- `love_it` - "Love it!"
- `amazing` - "Amazing!"

---

## Database Commands

### Generate Migration

After changing schema, generate a migration:

```bash
npm run db:generate
```

This creates SQL migration files in `./drizzle/`

### Apply Migration

Apply migrations to database:

```bash
npm run db:migrate
```

### Push Schema (Development)

Push schema changes directly without migrations (dev only):

```bash
npm run db:push
```

⚠️ **Warning:** This bypasses migrations. Use in development only.

### Drizzle Studio

Open visual database browser:

```bash
npm run db:studio
```

Launches at http://localhost:4983

---

## Using the Database

### Import the Database

```typescript
import { db, schema } from '$lib/server/db';
```

### Query Examples

**Get all designs for a user:**

```typescript
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';

const userDesigns = await db.query.designs.findMany({
	where: eq(schema.designs.userId, userId),
	orderBy: (designs, { desc }) => [desc(designs.createdAt)]
});
```

**Create a new design:**

```typescript
import { nanoid } from 'nanoid';
import { db, schema } from '$lib/server/db';

const newDesign = await db.insert(schema.designs).values({
	id: nanoid(),
	userId: userId,
	title: 'My Summer Dress',
	originalImageUrl: 'https://...',
	cleanedImageUrl: null,
	coloredOverlayUrl: null
});
```

**Get circle with members:**

```typescript
const circleWithMembers = await db.query.circles.findFirst({
	where: eq(schema.circles.id, circleId),
	with: {
		members: {
			with: {
				user: true
			}
		}
	}
});
```

**Add reaction to shared item:**

```typescript
await db.insert(schema.reactions).values({
	id: nanoid(),
	userId: userId,
	sharedItemId: sharedItemId,
	reactionType: 'heart'
});
```

---

## Safety & Privacy Features

### No Free Text Comments (V1)

To ensure kid safety:
- ✅ **Reactions:** Preset emoji reactions only
- ✅ **Compliments:** Preset compliment phrases only
- ❌ **Free text:** Not allowed in V1

### Invite-Only Circles

- All sharing happens in private circles
- Circles require invite code to join
- No public discovery or browsing
- Circle owner controls membership

### Minimal Data Collection

- Nickname instead of full name
- No birthdates or personal info
- Avatar is optional
- Parent/guardian approval (future)

---

## ID Generation

Use `nanoid` for generating IDs:

```typescript
import { nanoid } from 'nanoid';

const id = nanoid(); // e.g., "V1StGXR8_Z5jdHi6B-myT"
```

**Why nanoid?**
- URL-safe
- Collision-resistant
- Shorter than UUID
- Fast

---

## Environment Setup

Ensure `DATABASE_URL` is set in `.env`:

```bash
DATABASE_URL="mysql://wrigs_user:password@localhost:3306/wrigs_fashion"
```

**For Docker:**
```bash
DATABASE_URL="mysql://wrigs_user:password@db:3306/wrigs_fashion"
```

---

## Backup & Restore

### Backup Database

```bash
# Using Docker
docker-compose exec db mysqldump -u wrigs_user -p wrigs_fashion > backup.sql

# Direct MySQL
mysqldump -u wrigs_user -p wrigs_fashion > backup.sql
```

### Restore Database

```bash
# Using Docker
docker-compose exec -T db mysql -u wrigs_user -p wrigs_fashion < backup.sql

# Direct MySQL
mysql -u wrigs_user -p wrigs_fashion < backup.sql
```

---

## Migration Strategy

**Development:**
1. Modify `schema.ts`
2. Run `npm run db:push` to update local DB
3. Test changes

**Production:**
1. Modify `schema.ts`
2. Run `npm run db:generate` to create migration
3. Review generated SQL in `./drizzle/`
4. Commit migration files
5. Deploy and run `npm run db:migrate`

---

## Performance Considerations

### Indexes

Primary keys and foreign keys are automatically indexed.

**Future optimizations:**
- Index on `designs.userId` (user portfolio queries)
- Index on `circles.inviteCode` (invite code lookups)
- Index on `circleMembers.userId` (user circle queries)

### JSON Columns

- `dollTemplates.regions` - Stores outfit placement data
- `dollProjects.pieces` - Stores outfit configuration

These are stored as JSON for flexibility in V1. Consider normalizing in V2 if queries become slow.

---

## Next Steps

1. ✅ Schema defined
2. Run `npm install` to install dependencies
3. Start Docker database: `docker-compose -f docker-compose.dev.yml up db`
4. Run `npm run db:push` to create tables
5. Use `npm run db:studio` to explore schema
6. Start building API endpoints!
