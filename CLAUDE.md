# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Wrigs Fashion (V1)
**Project:** Web app for young girls who like to draw fashion designs
**V1 Theme:** Draw it → digitize it → make a printable paper doll (PDF)
**Primary goal:** A delightful, safe creative flow that works great on tablets and laptops.

**Current Status:** Phase 2 Complete (Paper Doll System + PDF Generation)
**Next Phase:** Authentication + Database Integration

---

## 1) Product Summary (V1)
Wrigs Fashion is a web app where kids can:
1) Upload a photo of a hand-drawn fashion sketch (phone/tablet photo)
2) Clean it up (crop, straighten, remove background, enhance lines)
3) Color / add simple patterns digitally
4) Place the design on a paper doll template
5) Export a printable PDF (doll + outfit cutouts with cut lines + tabs)
6) Save to a private portfolio and optionally share within invite-only friend circles

**Non-goals (V1):**
- No public social feed
- No AI-generated clothing from text prompts
- No complex pose estimation / body mapping
- No real-time multiplayer editing

---

## 2) Target User + Safety
**Primary users:** kids (~7–13) who like drawing fashion.  
**Safety baseline:**
- Invite-only “Circles” (closed groups). Default: private portfolio only.
- Disable public discovery.
- Kid-friendly comments: reactions + preset compliments only (no free text) for V1.
- Minimal personal data collection. Use a nickname and avatar, not full names.

---

## 3) Core User Flows
### Flow A — Sketch Upload → Digitize
- User uploads a photo
- App shows a simple crop + rotate UI
- App runs image cleanup:
  - background removal (or thresholding) to white
  - line enhancement
- Save as “Design”

### Flow B — Color + Pattern (Lightweight V1)
- Simple brush + fill
- A small set of patterns (polka dot, plaid, denim, sparkle overlay)
- Save a “Colored Layer” over the cleaned sketch

### Flow C — Paper Doll Generator → PDF Export
- Choose a doll template (start with 1 pose)
- Choose outfit category: top/bottom/dress/jacket/shoes/accessories
- Place design into a template region (snap/fit)
- Auto-generate printable PDF:
  - Page 1: paper doll base with cut line
  - Page 2: outfit pieces with cut lines + tabs
  - Optional: ink-saver (B/W) mode

### Flow D — Portfolio + Sharing (V1)
- Portfolio lists designs and generated dolls
- Share to Circles via invite code or email invitation (simple + safe)
- Reactions + preset compliments

---

## 4) MVP Feature Set (Ship List)
**Must-have for V1:**
- Auth (simple): email magic link OR username+password (pick easiest)
- Upload image
- Crop/rotate + cleanup pipeline
- Basic coloring/pattern overlay
- Paper doll template placement
- PDF export (Letter + A4)
- Portfolio CRUD (create/list/view/delete)
- Basic Circles (invite-only) + sharing
- Deploy cheaply (single web app + managed DB + object storage)

**Nice-to-have if time:**
- ✅ Multiple doll body types (DONE: 3 body types)
- ✅ More poses (DONE: 2 poses)
- Sticker/badge rewards

---

## 5) Technical Stack (Actual Implementation)
**Web stack:**
- SvelteKit (with Svelte 5 runes) + TypeScript
- TailwindCSS + DaisyUI (Lemon Meringue theme)
- Drizzle ORM + MySQL (schema defined, not yet connected)
- Auth: Lucia Auth (planned, not yet implemented)
- Object storage: Local static files (production TBD: Supabase Storage or R2)
- Image processing: Sharp.js (server-side)
- PDF generation: PDFKit (✅ implemented)
- Deployment: adapter-node (Node.js server)

**Key Architecture Decisions:**
- Session-based auth (not cookies) via sessionId stored in DB
- Catalogs use sessionId (not userId) to support pre-auth usage
- Image processing server-side (2-4 seconds, 10MB limit)
- Synchronous API endpoints (no background jobs yet)
- Canvas-based editor for real-time drawing
- Static file serving from `/static` directory

---

## 6) Data Model (Drizzle ORM Schema)
**Schema Location:** `src/lib/server/db/schema.ts`

### Core Tables (Implemented)

**users**
- id (varchar PK), email (unique), nickname, avatarUrl
- createdAt

**designs** (fashion sketches)
- id (varchar PK), userId (FK), title
- originalImageUrl, cleanedImageUrl, coloredOverlayUrl
- createdAt, updatedAt
- Cascade delete on user deletion

**dollTemplates** (paper doll bases)
- id (varchar PK), name, pose, baseImageUrl
- printableBasePdfUrl, regions (JSON)
- createdAt

**dollProjects** (generated PDFs)
- id (varchar PK), userId (FK), designId (FK), dollTemplateId (FK)
- pieces (JSON array), pdfUrl
- createdAt
- Cascade delete on user/design deletion

**catalogs** (NEW: fashion collections)
- id (varchar PK), sessionId, title, shareSlug (unique)
- isPublic, backgroundColor, backgroundPattern
- createdAt, updatedAt
- Note: Uses sessionId (not userId) for pre-auth support

**catalogItems** (images on catalog canvas)
- id (varchar PK), catalogId (FK), imageUrl
- positionX, positionY, width, height, rotation, zIndex
- createdAt

### Sharing Tables (Planned)

**circles** (invite-only groups)
- id (varchar PK), ownerId (FK), name, inviteCode (unique)
- createdAt

**circleMembers**
- id (varchar PK), circleId (FK), userId (FK), role
- joinedAt

**sharedItems**
- id (varchar PK), circleId (FK), itemType, itemId, sharedBy (FK)
- createdAt

**reactions** (emoji reactions)
- id (varchar PK), userId (FK), sharedItemId (FK), reactionType
- createdAt

**compliments** (preset phrases)
- id (varchar PK), userId (FK), sharedItemId (FK), complimentType
- createdAt

### ID Generation
Use `nanoid()` for all IDs (URL-safe, collision-resistant, shorter than UUID)

---

## 7) Image Cleanup Pipeline (V1)
**Input:** photo from phone/tablet  
**Steps:**
1) Validate file type + size limit
2) Crop/rotate (client UI)
3) Server pipeline:
   - resize to max dimension (e.g., 2000px)
   - convert to grayscale
   - simple background removal (threshold) OR edge detection
   - boost contrast
   - output PNG with white background
4) Store cleaned image in object storage

**Constraints:**
- Keep it predictable; don’t over-promise “perfect digitization” in V1.

---

## 8) Paper Doll Template System (✅ IMPLEMENTED)
**Goal:** Make printable cutouts from templates without complex AI.

**Templates Created (6 total):**
- ✅ 2 poses:
  - Pose A: Classic paper doll pose with arms out (great for jackets/accessories)
  - Pose B: Standing pose with arms down (great for dresses/flowing designs)
- ✅ 3 inclusive body types (no body shaming):
  - Classic Build
  - Curvy Build
  - Petite Build
- ✅ All templates are SVG files in `static/templates/dolls/`

**Outfit Placement Regions (defined for each template):**
- topRegion: where shirts/tops go
- bottomRegion: where pants/skirts go
- dressRegion: full-body dress region
- shoesRegion: footwear area
- Coordinates stored in `src/lib/data/doll-templates.ts`

**User Flow:**
1. Select template (filter by pose/body type)
2. Position and scale design on canvas with live preview
3. Choose outfit category (top/bottom/dress/shoes)
4. Generate PDF

**Deliverable:** A 2-page PDF with:
- Page 1: Paper doll base with cut lines and fold tab
- Page 2: Outfit piece with user's design, tabs, and cut lines
- Both Letter (8.5x11) and A4 (210x297mm) sizes supported

---

## 9) Acceptance Criteria (Definition of Done)
- User can upload sketch, clean it, and save a Design.
- User can apply at least 3 patterns and basic color fill.
- User can generate a printable PDF paper doll (Letter and A4).
- PDF prints with correct margins; cut lines visible; tabs included.
- User can view portfolio and re-download PDFs.
- Sharing is limited to invite-only circles; no public browsing.
- App deploys on a low-cost plan and works on tablet browsers.

---

## 10) Milestones (Execution Order)
1) ✅ **Phase 1:** Repo scaffolding + image upload + processing + canvas editor
   - Upload with drag-and-drop + freeform crop
   - Sharp.js pipeline (background removal, color normalization)
   - 6 drawing tools (Brush, Spray, Glitter, Stamp, Magic Wand, Eraser)
   - Pattern overlays (dots, stripes, stars, hearts, sparkles)

2) ✅ **Phase 2:** Paper doll templates + PDF generation
   - 6 inclusive templates (2 poses × 3 body types)
   - Template selection UI with filters
   - Interactive placement with canvas preview
   - PDFKit 2-page output (Letter + A4)

3) ✅ **Phase 2.5:** Catalog system (BONUS feature)
   - Multi-image canvas for fashion collections
   - Drag/resize/rotate items on canvas
   - Share catalogs via unique slugs
   - Session-based (works without auth)

4) 📋 **Phase 3:** Authentication + Database Integration (NEXT)
   - Lucia Auth setup
   - User registration/login
   - Connect to MySQL database
   - Migrate session-based catalogs to user accounts

5) 📋 **Phase 4:** Portfolio CRUD
   - Portfolio listing page
   - Design management (view, delete, re-download)
   - Link uploaded designs to user accounts

6) 📋 **Phase 5:** Sharing + Circles
   - Invite-only circles
   - Share designs/dolls to circles
   - Reactions + preset compliments

7) 📋 **Phase 6:** Polish & Deploy
   - Onboarding flow
   - Empty states
   - Error handling UX
   - Production deployment

---

## 11) Claude Code Instructions (How to Help)
When implementing, Claude should:
- Keep V1 scope tight and avoid speculative features.
- Prefer simple, reliable solutions over complex AI.
- Provide runnable code, migrations, and minimal config.
- Include basic tests for image upload and PDF generation.
- Add clear README setup steps and .env template.

**Key questions Claude should ask only if blocked:**
- Which auth approach? (Supabase Auth vs NextAuth)
- Which storage? (Supabase Storage vs R2/S3)
- Letter-only vs both Letter and A4 (default to both)

---

## 12) Repo Conventions

### Code Style
- TypeScript strict mode enabled
- **Svelte 5 runes:** Use `$state`, `$derived`, `$effect` (not Svelte 4 syntax)
- Event handlers: Use `onchange={handler}` NOT `on:change={handler}`
- Functional style (no class components)

### File Organization (SvelteKit)
```
src/
├── routes/                    # Pages and API routes
│   ├── +page.svelte          # Homepage
│   ├── +layout.svelte        # Root layout
│   ├── upload/               # Upload flow
│   ├── editor/               # Canvas editor
│   ├── doll-builder/         # Paper doll system
│   ├── catalogs/             # Catalog system
│   ├── portfolio/            # Portfolio (needs implementation)
│   └── api/                  # API endpoints
│       ├── upload/+server.ts
│       ├── generate-pdf/+server.ts
│       └── catalogs/         # Catalog CRUD APIs
├── lib/
│   ├── components/           # Reusable Svelte components
│   │   └── catalog/          # Catalog-specific components
│   ├── services/             # Business logic
│   │   └── pdf-generator.ts  # PDFKit service
│   ├── data/
│   │   └── doll-templates.ts # Template metadata
│   └── server/               # Server-only code
│       ├── session.ts        # Session management
│       └── db/               # Drizzle ORM
│           ├── index.ts      # DB client
│           └── schema.ts     # Database schema
static/                        # Static assets
├── templates/dolls/          # 6 SVG doll templates
├── uploads/                  # Processed images (runtime)
└── pdfs/                     # Generated PDFs (runtime)
```

### Naming Conventions
- Components: PascalCase (e.g., `CatalogCanvas.svelte`)
- Utilities: camelCase (e.g., `pdfGenerator.ts`)
- API routes: SvelteKit convention (e.g., `+server.ts`, `[id]/+server.ts`)
- Database tables: snake_case (e.g., `doll_projects`)

### Environment Variables
```bash
DATABASE_URL="mysql://user:pass@localhost:3306/wrigs_fashion"
# Optional for development - defaults will work
```

### Testing Approach
- Manual testing on tablet viewports (768px, 1024px)
- Test image formats: JPG, PNG, HEIC
- Test PDF on both Letter (8.5x11) and A4 (210x297mm)
- Print test: Verify cut lines and margins

---

## 13) Technical Constraints & Limits

### Image Processing
- Max upload size: 10MB
- Supported formats: JPG, PNG, HEIC
- Processing timeout: 30 seconds
- Max dimension after resize: 2000px

### PDF Generation
- Page sizes: US Letter (8.5x11) and A4 (210x297mm)
- Safe print margins: 0.5 inch / 12.7mm
- Max file size: 5MB per PDF

### Storage
- Use object storage for all user uploads and generated files
- Store processed images as PNG with white background
- Generated PDFs stored for re-download (not regenerated)

### Performance Targets
- Image cleanup: <5 seconds for typical sketch photo
- PDF generation: <10 seconds including storage upload
- Portfolio page load: <2 seconds

---

## 14) Development Workflow & Commands

### Initial Setup

**Prerequisites:**
- Node.js 18+ (use nvm: `nvm install 18 && nvm use 18`)
- npm package manager

**Setup Steps:**
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (OPTIONAL - app works without DB)
# Only needed if connecting to MySQL database
echo 'DATABASE_URL="mysql://user:pass@localhost:3306/wrigs_fashion"' > .env

# 3. Start development server
npm run dev
# App runs on http://localhost:5173 (default Vite port)
# Or http://localhost:3001 if 5173 is in use
```

**Current Phase Status:**
- ✅ Phase 1: Upload + Crop + Processing + Editor
- ✅ Phase 2: Paper Doll Templates + PDF Generation
- ✅ Phase 2.5: Catalog System (bonus feature)
- 📋 Phase 3 (NEXT): Authentication + Database Integration
- 📋 Phase 4: Portfolio CRUD + User Management
- 📋 Phase 5: Sharing + Circles

### Common Commands

**Development:**
```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
```

**Database (Drizzle ORM):**
```bash
npm run db:generate  # Generate migration files from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema changes directly (dev only, bypasses migrations)
npm run db:studio    # Open Drizzle Studio (database GUI at http://localhost:4983)
```

**Important Database Notes:**
- Schema is defined but database is NOT yet connected
- App works without database connection (uses sessionId + static files)
- Phase 3 will connect MySQL and run migrations
- `db:push` is for development only - use `db:generate` + `db:migrate` for production

### Development Patterns

**Component Structure:**
- Use Svelte 5 runes: `$state`, `$derived`, `$effect`
- Keep components in `src/lib/components/`
- Group by feature (e.g., `editor/`, `portfolio/`, `shared/`)

**Styling:**
- TailwindCSS utility classes for layout
- DaisyUI components for buttons, cards, forms
- Custom CSS in `src/app.css` for global styles
- Inline styles for dynamic colors (gradients, theme customization)

**Current Color Scheme (Lemon Meringue):**
```javascript
// tailwind.config.js
wrigs: {
  primary: '#FFF8B8',    // Soft buttery yellow
  secondary: '#FFE9C5',  // Warm cream
  accent: '#FFD4E5',     // Light blush pink
  success: '#D0F0C0'     // Fresh mint green
}
```

**Interactive Design Sessions:**
```bash
# Launch Playwright for real-time design iteration
npx playwright@1.58.1 install chromium  # First time only
npx playwright@1.58.1 codegen http://localhost:3001/
```

**Real-Time Color Updates:**
- Use `$effect()` for reactive side effects
- CSS custom properties for dynamic theming
- Style injection pattern (see ColorCustomizer.svelte)

**Image Processing (Implemented):**
- Location: `src/routes/api/upload/+server.ts`
- Sharp.js multi-step pipeline (brightness boost, saturation, normalization, posterization)
- Max upload: 10MB, formats: JPG, PNG, HEIC
- Output: PNG with neutral gray background (#f8f8f8), max 2000px
- Color normalization: 32 colors (improves Magic Wand tool)
- Processing time: 2-4 seconds typical

**PDF Generation (Implemented):**
- Location: `src/lib/services/pdf-generator.ts` (378 lines)
- Uses PDFKit for server-side generation
- Generates 2-page PDFs:
  - Page 1: Paper doll base with cut lines and fold tab
  - Page 2: Outfit piece with user's design, tabs, and cut lines
- Page sizes: US Letter and A4
- Safe margins: 0.5 inch / 12.7mm
- Stored in: `static/pdfs/`

**Error Handling:**
- SvelteKit: `throw error(404, 'Not found')`
- Client-side: toast notifications
- Server-side: structured error responses

**Testing:**
- Manual testing on tablet viewports (Chrome DevTools)
- Test with real images: JPG, PNG, HEIC formats
- Print test PDFs to verify cut lines and margins
- No automated tests yet (add in Phase 6)

**Troubleshooting:**
```bash
# Permission errors with .svelte-kit directory
sudo rm -rf .svelte-kit
npm run dev

# Kill all Vite processes if port conflicts
pkill -f "vite dev"
npm run dev

# Check for multiple Vite instances
ps aux | grep vite

# Clear node_modules if dependency issues
rm -rf node_modules package-lock.json
npm install
```

---

## 15) Architecture Patterns

**Note:** This section will be populated as code is implemented. The structure below represents the intended organization.

### Service Layer Structure
```
/src/lib/services/ (planned)
  - pdf-generator.ts - PDFKit wrapper (not yet implemented)
  - storage.ts - Storage client (not yet needed)
  - auth.ts - Auth utilities (not yet needed)
```

### API Routes (Implemented)
```
/src/routes/api/
  ✅ upload/+server.ts
     - POST: Upload image, process with Sharp.js
     - Returns: original + cleaned image URLs

  ✅ generate-pdf/+server.ts
     - POST: Generate paper doll PDF
     - Inputs: templateId, designUrl, placement, paperSize
     - Returns: PDF download URL

  ✅ catalogs/+server.ts
     - GET: List catalogs for session
     - POST: Create new catalog

  ✅ catalogs/[id]/+server.ts
     - GET: Get catalog by ID
     - PATCH: Update catalog (title, background)
     - DELETE: Delete catalog

  ✅ catalogs/[id]/items/+server.ts
     - POST: Add item to catalog

  ✅ catalogs/[id]/items/[itemId]/+server.ts
     - PATCH: Update item position/size/rotation
     - DELETE: Remove item

  ✅ catalogs/[id]/share/+server.ts
     - POST: Generate shareable link

  📋 designs/ - Planned (needs auth)
  📋 circles/ - Planned (Phase 5)
```

### Pages (Implemented)
```
/src/routes/
  ✅ +page.svelte - Homepage with hero section
  ✅ +layout.svelte - Navigation + footer
  ✅ upload/+page.svelte - Upload + freeform crop tool
  ✅ editor/+page.svelte - Canvas editor with 6 tools
  ✅ doll-builder/+page.svelte - Template selection
  ✅ doll-builder/place/+page.svelte - Design placement UI
  ✅ catalogs/+page.svelte - Catalog listing
  ✅ catalogs/[id]/+page.svelte - Catalog canvas editor
  ✅ catalogs/share/[shareSlug]/+page.svelte - Public catalog view
  📋 portfolio/+page.svelte - Portfolio (placeholder, needs implementation)
```

### Components (Implemented)
```
/src/lib/components/
  ✅ catalog/
     - CatalogCanvas.svelte - Drag/resize/rotate items
     - CatalogToolbar.svelte - Canvas controls
     - CatalogItem.svelte - Individual catalog item
     - AddToCatalogModal.svelte - Add items modal
     - CatalogShareModal.svelte - Share link modal

  ✅ ColorCustomizer.svelte - Design tool (remove from production)
```

---

## 16) Hosting (Affordable)
Initial recommendation:
- Vercel for web app
- Supabase for Postgres + Storage + Auth
OR
- Cloudflare Pages + R2 + Neon (if optimizing cost)

---

## 17) GitHub Actions + CI/CD

Two GitHub Actions workflows are configured:

### claude.yml - Claude PR Assistant
Triggers on:
- Issue comments containing `@claude`
- PR comments containing `@claude`
- New issues with `@claude` in title/body

Uses `anthropics/claude-code-action@v1` to respond to tagged requests.

### claude-code-review.yml - Automated Code Review
Triggers on:
- Pull request opened/synchronized/reopened

Uses Claude Code Review plugin to automatically review PR changes.

**Required Secret:** `ANTHROPIC_API_KEY` must be set in repository secrets.

---

## 18) Session Management (Current Implementation)

**Important:** The app currently uses session-based access WITHOUT authentication.

**How it works:**
- `sessionId` generated on first visit (stored in `src/lib/server/session.ts`)
- Catalogs table uses `sessionId` (not `userId`)
- This allows users to create catalogs before signing up

**Migration path (Phase 3):**
1. Add authentication with Lucia Auth
2. Migrate session-based catalogs to user accounts
3. Keep sessionId for anonymous users (optional)
4. Link catalogs to userId on login/signup

---

## 19) Critical Implementation Notes

### Image Processing Pipeline
**Location:** `src/routes/api/upload/+server.ts`

Multi-step Sharp.js pipeline:
1. Resize to max 2000px (maintain aspect ratio)
2. Brightness boost (1.4x)
3. Saturation boost (1.5x)
4. Normalize (push background toward white)
5. Posterize to 32 colors (helps Magic Wand tool)
6. Sharpen edges
7. Add neutral gray padding (#f8f8f8)

**Why 32 colors?** Makes Magic Wand selection effective by consolidating similar colors.

### PDF Generation Service
**Location:** `src/lib/services/pdf-generator.ts` (378 lines)

PDFKit-based service generates 2-page PDFs:
- **Page 1:** Paper doll base with cut lines and fold tab
- **Page 2:** Outfit piece with user's design, tabs, and cut lines

**Critical details:**
- Safe print margins: 0.5 inch / 12.7mm
- Dashed cut lines: `dash(5, 3)` with `#999` color
- Tab labels: Small "fold" text
- Footer: "✨ Made with Wrigs Fashion ✨"
- Supports Letter (8.5×11) and A4 (210×297mm)

### Paper Doll Template System
**Location:** `src/lib/data/doll-templates.ts` (184 lines)

6 templates hardcoded in TypeScript (not in DB yet):
- 2 poses (A: arms out, B: arms down)
- 3 body types (Classic, Curvy, Petite)
- Each has defined regions: top, bottom, dress, shoes
- Regions use coordinate system: `{x, y, width, height}`

**Why hardcoded?** Simplifies V1. Can migrate to DB in Phase 3.

### Canvas Editor Tools
**Location:** `src/routes/editor/+page.svelte` (560 lines)

6 drawing tools implemented:
1. **Brush** - Basic drawing with variable size
2. **Spray Paint** - Particle spray effect
3. **Glitter** - Sparkle overlay effect
4. **Stamp** - Repeating pattern stamps
5. **Magic Wand** - Flood fill tool (works well with 32-color posterization)
6. **Eraser** - Remove pixels

Pattern overlays: dots, stripes, stars, hearts, sparkles

### Catalog System Architecture
**Key Design Decision:** Catalogs are session-based (not user-based) to allow pre-auth usage.

**Data Flow:**
1. User visits `/catalogs` → sessionId generated/retrieved
2. Create catalog → stored with sessionId
3. Add items → drag/resize/rotate on canvas
4. Share → generate unique shareSlug
5. Anyone with shareSlug can view (read-only)

**Migration to auth:** When user signs up, migrate catalogs from sessionId to userId.

---

## 20) Known Issues & TODOs

### Remove Before Production
- ColorCustomizer component in `+layout.svelte` (design tool, not user feature)

### Database Not Connected
- Schema defined but no migrations run
- All data currently in-memory or static files
- Phase 3 will connect MySQL and persist data

### Missing Features
- ❌ Authentication (Phase 3)
- ❌ Portfolio CRUD (Phase 4)
- ❌ User management (Phase 4)
- ❌ Sharing circles (Phase 5)
- ❌ Reactions/compliments (Phase 5)

### File Storage Strategy
Currently: Local static files in `/static/uploads/` and `/static/pdfs/`
Production: Needs object storage (Supabase Storage, Cloudflare R2, or AWS S3)

---

## 21) Quick Reference

### Key Files to Know

**Core Pages:**
- `/src/routes/upload/+page.svelte` - Upload + freeform crop (569 lines)
- `/src/routes/editor/+page.svelte` - Canvas editor with 6 tools (560 lines)
- `/src/routes/doll-builder/+page.svelte` - Template selection (247 lines)
- `/src/routes/doll-builder/place/+page.svelte` - Design placement (367 lines)

**API Endpoints:**
- `/src/routes/api/upload/+server.ts` - Image processing (113 lines)
- `/src/routes/api/generate-pdf/+server.ts` - PDF generation (40 lines)
- `/src/routes/api/catalogs/` - Catalog CRUD endpoints

**Services:**
- `/src/lib/services/pdf-generator.ts` - PDFKit service (378 lines)
- `/src/lib/server/session.ts` - Session management
- `/src/lib/data/doll-templates.ts` - Template metadata (184 lines)

**Database:**
- `/src/lib/server/db/schema.ts` - Drizzle schema (261 lines)
- `/src/lib/server/db/index.ts` - DB client
- `/drizzle.config.ts` - Drizzle configuration

**Config:**
- `/svelte.config.js` - SvelteKit config (adapter-node)
- `/tailwind.config.js` - Tailwind + DaisyUI (Lemon Meringue theme)
- `/package.json` - Dependencies and scripts

### User Flow (Complete Path)
1. **Upload:** `/upload` → drag/drop image → freeform crop → process
2. **Edit:** `/editor` → use 6 tools → apply patterns → save PNG
3. **Paper Doll:** Click "Create Paper Doll" → `/doll-builder` → select template
4. **Place:** `/doll-builder/place` → position design → adjust scale → choose paper size
5. **Download:** Click "Generate PDF" → download 2-page printable

### Common Tasks

**Add a new API endpoint:**
1. Create `/src/routes/api/your-endpoint/+server.ts`
2. Export `GET`, `POST`, `PATCH`, `DELETE` functions
3. Return `json()` from `@sveltejs/kit`

**Add a new page:**
1. Create `/src/routes/your-page/+page.svelte`
2. Add navigation link in `/src/routes/+layout.svelte`
3. Add server data with `/src/routes/your-page/+page.server.ts` (optional)

**Query database (when connected):**
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

**Generate new migration:**
```bash
# 1. Edit src/lib/server/db/schema.ts
# 2. Generate migration
npm run db:generate
# 3. Review generated SQL in ./drizzle/
# 4. Apply migration
npm run db:migrate
```

---

## 22) Open Questions (Track but don't block)
- Age gating / COPPA compliance approach (V1 can avoid collecting personal data)
- Parent dashboard (V2)
- Advanced background removal model (V2)
- Real-time collaboration (V2)

---
