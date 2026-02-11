# Development Setup & Workflow

Complete guide for setting up and working with Wrigs Fashion.

## Prerequisites

- Node.js 18+ (use nvm: `nvm install 18 && nvm use 18`)
- npm package manager
- MySQL 8.0+ (required for authentication and portfolio features)

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MySQL Database

**Option A: Using Docker (recommended)**
```bash
docker run --name wrigs-mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=wrigs_fashion -e MYSQL_USER=wrigs_user \
  -e MYSQL_PASSWORD=password -p 3306:3306 -d mysql:8.0
```

**Option B: Local MySQL installation**
```bash
mysql -u root -p
CREATE DATABASE wrigs_fashion;
CREATE USER 'wrigs_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON wrigs_fashion.* TO 'wrigs_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables (REQUIRED)
```bash
cp .env.example .env
# Edit .env with your database credentials and generate AUTH_SECRET
# Generate AUTH_SECRET: openssl rand -hex 32
```

### 4. Run Database Migrations
```bash
npm run db:push  # For development (fast)
# OR
npm run db:generate && npm run db:migrate  # For production (versioned)
```

### 5. Start Development Server
```bash
npm run dev
# App runs on http://localhost:5173 (default Vite port)
# Or http://localhost:3001 if 5173 is in use
```

## Common Commands

### Development
```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
```

### Database (Drizzle ORM)
```bash
npm run db:generate  # Generate migration files from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema changes directly (dev only, bypasses migrations)
npm run db:studio    # Open Drizzle Studio (database GUI at http://localhost:4983)
```

**Important:** `db:push` is for development only - use `db:generate` + `db:migrate` for production.

## Development Patterns

### Component Structure
- Use Svelte 5 runes: `$state`, `$derived`, `$effect`
- Keep components in `src/lib/components/`
- Group by feature (e.g., `editor/`, `portfolio/`, `shared/`)

### Styling
- TailwindCSS utility classes for layout
- DaisyUI components for buttons, cards, forms
- Custom CSS in `src/app.css` for global styles
- Inline styles for dynamic colors (gradients, theme customization)

### Current Color Scheme (Lemon Meringue)
```javascript
// tailwind.config.js
wrigs: {
  primary: '#FFF8B8',    // Soft buttery yellow
  secondary: '#FFE9C5',  // Warm cream
  accent: '#FFD4E5',     // Light blush pink
  success: '#D0F0C0'     // Fresh mint green
}
```

### Interactive Design Sessions
```bash
# Launch Playwright for real-time design iteration
npx playwright@1.58.1 install chromium  # First time only
npx playwright@1.58.1 codegen http://localhost:3001/
```

### Real-Time Color Updates
- Use `$effect()` for reactive side effects
- CSS custom properties for dynamic theming
- Style injection pattern (see ColorCustomizer.svelte)

### Error Handling
- SvelteKit: `throw error(404, 'Not found')`
- Client-side: toast notifications
- Server-side: structured error responses

### Testing
- Manual testing on tablet viewports (Chrome DevTools)
- Test with real images: JPG, PNG, HEIC formats
- Print test PDFs to verify cut lines and margins
- Playwright E2E tests: `npm run test` (Phase 6)

## Common Tasks

### Add a new API endpoint
1. Create `/src/routes/api/your-endpoint/+server.ts`
2. Export `GET`, `POST`, `PATCH`, `DELETE` functions
3. Return `json()` from `@sveltejs/kit`

### Add a new page
1. Create `/src/routes/your-page/+page.svelte`
2. Add navigation link in `/src/routes/+layout.svelte`
3. Add server data with `/src/routes/your-page/+page.server.ts` (optional)

### Query database
```typescript
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';

// Query
const results = await db.query.designs.findMany({
  where: eq(schema.designs.userId, userId)
});

// Insert
await db.insert(schema.designs).values({
  id: nanoid(),
  userId,
  title: 'My Design'
});
```

### Generate new migration
```bash
# 1. Edit src/lib/server/db/schema.ts
# 2. Generate migration
npm run db:generate
# 3. Review generated SQL in ./drizzle/
# 4. Apply migration
npm run db:migrate
```

## Troubleshooting

### Permission errors with .svelte-kit directory
```bash
sudo rm -rf .svelte-kit
npm run dev
```

### Kill all Vite processes if port conflicts
```bash
pkill -f "vite dev"
npm run dev
```

### Check for multiple Vite instances
```bash
ps aux | grep vite
```

### Clear node_modules if dependency issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Key Implementation Details

### Image Processing (Implemented)
Location: `src/routes/api/upload/+server.ts`
- Sharp.js multi-step pipeline (brightness boost, saturation, normalization, posterization)
- Max upload: 10MB, formats: JPG, PNG, HEIC
- Output: PNG with neutral gray background (#f8f8f8), max 2000px
- Color normalization: 32 colors (improves Magic Wand tool)
- Processing time: 2-4 seconds typical

### PDF Generation (Implemented)
Location: `src/lib/services/pdf-generator.ts` (378 lines)
- Uses PDFKit for server-side generation
- Generates 2-page PDFs:
  - Page 1: Paper doll base with cut lines and fold tab
  - Page 2: Outfit piece with user's design, tabs, and cut lines
- Page sizes: US Letter and A4
- Safe margins: 0.5 inch / 12.7mm
- Stored in: `static/pdfs/`

## Project Status

**Current Phase:** Phase 5 Complete (Circles + Sharing System)
**Next Phase:** Polish & Deploy (Phase 6)

- ✅ Phase 1: Upload + Crop + Processing + Editor
- ✅ Phase 2: Paper Doll Templates + PDF Generation
- ✅ Phase 2.5: Catalog System (bonus feature)
- ✅ Phase 3: Authentication + Database Integration
- ✅ Phase 4: Portfolio CRUD + User Management
- ✅ Phase 5: Sharing + Circles
- 📋 Phase 6 (NEXT): Polish & Deploy
