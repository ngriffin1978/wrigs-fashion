# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Wrigs Fashion (V1)
**Project:** Web app for young girls who like to draw fashion designs
**V1 Theme:** Draw it → digitize it → make a printable paper doll (PDF)
**Primary goal:** A delightful, safe creative flow that works great on tablets and laptops.

**Current Status:** Phase 3 Complete (Authentication + Database Integration + Catalog Migration)
**Next Phase:** Sharing + Circles (Phase 5)

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
**Completed for V1:**
- ✅ Auth: Better Auth with email/password
- ✅ Upload image with drag-and-drop
- ✅ Crop/rotate + cleanup pipeline
- ✅ Basic coloring/pattern overlay
- ✅ Paper doll template placement
- ✅ PDF export (Letter + A4)
- ✅ Portfolio CRUD (create/list/view/delete)
- ✅ Multiple doll body types (3 body types)
- ✅ More poses (2 poses)
- ✅ Achievement badges and stats

**Remaining for V1:**
- 📋 Basic Circles (invite-only) + sharing
- 📋 Deploy to production (single web app + managed DB + object storage)

---

## 5) Technical Stack (Actual Implementation)
**Web stack:**
- SvelteKit (with Svelte 5 runes) + TypeScript
- TailwindCSS + DaisyUI (Lemon Meringue theme)
- Drizzle ORM + MySQL (✅ connected and operational)
- Auth: Better Auth (✅ implemented with email/password)
- Object storage: Local static files (production TBD: Cloudflare R2)
- Image processing: Sharp.js (server-side)
- PDF generation: PDFKit (✅ implemented)
- Deployment: adapter-node (Node.js server)

**Key Architecture Decisions:**
- Better Auth with email/password authentication (cookie-based sessions)
- Dual-mode system: sessionId for anonymous users, userId for authenticated users
- Automatic catalog migration from sessionId to userId on registration
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

4) ✅ **Phase 3:** Authentication + Database Integration (DONE)
   - Better Auth setup with email/password
   - User registration/login/logout pages
   - MySQL database connected via Drizzle ORM
   - Automatic catalog migration from sessionId to userId on signup
   - Auth-aware UI with conditional navigation
   - Protected routes with server-side auth guards
   - Onboarding flow for new users

5) ✅ **Phase 4:** Portfolio CRUD (DONE)
   - Portfolio listing page with grid/list views
   - Design management (view, edit, delete, download)
   - Create paper dolls from designs
   - Achievement badges and stats
   - Empty state with call-to-action

6) 📋 **Phase 5:** Sharing + Circles (NEXT)
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
- MySQL 8.0+ (required for authentication and portfolio features)

**Setup Steps:**
```bash
# 1. Install dependencies
npm install

# 2. Set up MySQL database
# Option A: Using Docker (recommended)
docker run --name wrigs-mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=wrigs_fashion -e MYSQL_USER=wrigs_user \
  -e MYSQL_PASSWORD=password -p 3306:3306 -d mysql:8.0

# Option B: Local MySQL installation
mysql -u root -p
CREATE DATABASE wrigs_fashion;
CREATE USER 'wrigs_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON wrigs_fashion.* TO 'wrigs_user'@'localhost';
FLUSH PRIVILEGES;

# 3. Configure environment variables (REQUIRED for auth)
cp .env.example .env
# Edit .env with your database credentials and generate AUTH_SECRET
# Generate AUTH_SECRET: openssl rand -hex 32

# 4. Run database migrations
npm run db:push  # For development (fast)
# OR
npm run db:generate && npm run db:migrate  # For production (versioned)

# 5. Start development server
npm run dev
# App runs on http://localhost:5173 (default Vite port)
# Or http://localhost:3001 if 5173 is in use
```

**Current Phase Status:**
- ✅ Phase 1: Upload + Crop + Processing + Editor
- ✅ Phase 2: Paper Doll Templates + PDF Generation
- ✅ Phase 2.5: Catalog System (bonus feature)
- ✅ Phase 3: Authentication + Database Integration
- ✅ Phase 4: Portfolio CRUD + User Management
- 📋 Phase 5 (NEXT): Sharing + Circles

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
  ✅ auth/register/+server.ts
     - POST: Create user account with Better Auth
     - Migrates anonymous catalogs to user account
     - Returns: userId, session cookie

  ✅ auth/login/+server.ts
     - POST: Authenticate user
     - Returns: session cookie

  ✅ auth/logout/+server.ts
     - POST: Destroy session, clear cookies

  ✅ upload/+server.ts
     - POST: Upload image, process with Sharp.js
     - Returns: original + cleaned image URLs

  ✅ generate-pdf/+server.ts
     - POST: Generate paper doll PDF
     - Inputs: templateId, designUrl, placement, paperSize
     - Returns: PDF download URL

  ✅ catalogs/+server.ts
     - GET: List catalogs for session/user
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

  ✅ designs/+server.ts
     - POST: Save design to portfolio (auth required)

  ✅ designs/[id]/+server.ts
     - DELETE: Delete design from portfolio (auth required)

  📋 circles/ - Planned (Phase 5)
```

### Pages (Implemented)
```
/src/routes/
  ✅ +page.svelte - Homepage with hero section
  ✅ +layout.svelte - Navigation + footer (auth-aware)
  ✅ upload/+page.svelte - Upload + freeform crop tool
  ✅ editor/+page.svelte - Canvas editor with 6 tools
  ✅ doll-builder/+page.svelte - Template selection
  ✅ doll-builder/place/+page.svelte - Design placement UI
  ✅ catalogs/+page.svelte - Catalog listing
  ✅ catalogs/[id]/+page.svelte - Catalog canvas editor
  ✅ catalogs/share/[shareSlug]/+page.svelte - Public catalog view
  ✅ portfolio/+page.svelte - Portfolio grid with stats (auth required)
  ✅ auth/register/+page.svelte - User registration
  ✅ auth/login/+page.svelte - User login
  ✅ onboarding/+page.svelte - Post-signup onboarding flow
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

## 18) Authentication System (Better Auth Implementation)

**Status:** ✅ IMPLEMENTED

**Authentication Provider:** Better Auth (v1.4.18)
- Email/password authentication
- Cookie-based sessions (30-day expiry)
- Server-side session validation via `hooks.server.ts`
- No email verification in V1 (optional for V2)

**Key Files:**
- `/src/lib/server/auth/config.ts` - Better Auth configuration
- `/src/lib/server/auth/guards.ts` - Route protection utilities
- `/src/lib/server/auth/validation.ts` - Input validation
- `/src/hooks.server.ts` - Global auth middleware
- `/src/app.d.ts` - TypeScript types for `event.locals.user`

**Auth Flow:**
1. User registers at `/auth/register`
2. Better Auth creates user + hashes password
3. Auto-login after registration
4. Session cookie set (`wrigs_session`)
5. Anonymous catalogs migrated to user account
6. Redirect to `/onboarding`

**Dual-Mode System (Anonymous + Authenticated):**
- **Anonymous users:** Use `sessionId` cookie for catalog access
- **Authenticated users:** Use `userId` from Better Auth session
- **On signup:** Automatic migration of sessionId catalogs to userId

**Protected Routes:**
- `/portfolio` - Requires authentication
- `/onboarding` - Requires authentication
- Other routes: Public (upload, editor, doll-builder work anonymously)

**Environment Variables:**
```bash
# Required for production
AUTH_SECRET="your_32_character_random_secret_key"
DATABASE_URL="mysql://user:pass@host:port/db"
PUBLIC_APP_URL="https://yourdomain.com"
BETTER_AUTH_URL="https://yourdomain.com"  # Optional, defaults to PUBLIC_APP_URL
```

**Database Schema (Better Auth Required Tables):**
- `users` - User accounts (id, email, password, name, image, role)
- `sessions` - Active sessions (id, userId, expiresAt, token)
- `accounts` - OAuth accounts (not used in V1, reserved for V2)
- `verifications` - Email verification tokens (not used in V1)

**Session Migration Service:**
Location: `/src/lib/server/services/catalog-migration.ts`
- Migrates catalogs from sessionId to userId on registration
- Preserves catalog history for new users
- Returns count of migrated catalogs

---

## 19) Better Auth Implementation Guide

### Why Better Auth?
Chosen over Lucia Auth (deprecated) and NextAuth for:
- Modern, actively maintained (v1.4.18)
- Built-in Drizzle ORM adapter
- Simple email/password authentication
- Cookie-based sessions out of the box
- Easy MySQL integration
- TypeScript-first design

### Setup Process (Already Completed)

**1. Install Better Auth:**
```bash
npm install better-auth
```

**2. Database Schema:**
Better Auth requires 4 tables (already in `schema.ts`):
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth providers (reserved for V2)
- `verifications` - Email verification tokens (reserved for V2)

**3. Auth Configuration:**
File: `/src/lib/server/auth/config.ts`
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'mysql',
    schema: { user, session, account, verification }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // V1: disabled
    minPasswordLength: 8
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30 // 30 days
  },
  secret: env.AUTH_SECRET,
  baseURL: env.PUBLIC_APP_URL
});
```

**4. Global Auth Middleware:**
File: `/src/hooks.server.ts`
```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (session) {
    event.locals.user = {
      id: session.user.id,
      email: session.user.email,
      nickname: session.user.name,
      // ... other fields
    };
  }

  return await resolve(event);
};
```

**5. API Endpoints Pattern:**
All auth endpoints follow this pattern:

```typescript
// Create a proper Request for Better Auth
const authRequest = new Request('http://localhost/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});

// Call Better Auth handler
const authResponse = await auth.handler(authRequest);
const data = await authResponse.json();

// Extract and set session cookie
const setCookieHeader = authResponse.headers.get('set-cookie');
// Parse and set cookie manually in SvelteKit
```

**6. Route Protection:**
File: `/src/lib/server/auth/guards.ts`
```typescript
export function requireAuth(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(303, '/auth/login');
  }
  return locals.user;
}
```

Usage in `+page.server.ts`:
```typescript
export const load: PageServerLoad = async ({ locals }) => {
  const user = requireAuth(locals);
  // ... fetch user-specific data
};
```

### Key Differences from Other Auth Libraries

**Better Auth vs Lucia Auth:**
- Lucia is deprecated (no longer maintained)
- Better Auth has built-in Drizzle adapter
- Better Auth handles Request/Response pattern natively

**Better Auth vs NextAuth:**
- Better Auth is framework-agnostic
- Simpler configuration for basic auth
- Native TypeScript support
- Better Drizzle ORM integration

### Common Patterns

**Accessing User in Server Code:**
```typescript
// In +page.server.ts
export const load = async ({ locals }) => {
  if (locals.user) {
    // User is authenticated
    const userId = locals.user.id;
  }
};
```

**Accessing User in API Routes:**
```typescript
// In +server.ts
export const POST = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }
  const userId = locals.user.id;
};
```

**Client-Side Auth State:**
Not directly available - use server load functions to pass user data to pages.

### Troubleshooting

**Issue: Session not persisting**
- Check AUTH_SECRET is set in `.env`
- Verify cookie is being set (check browser DevTools)
- Ensure `baseURL` matches your app URL

**Issue: "User not found" after registration**
- Check database migrations ran successfully
- Verify Better Auth created the user in `users` table
- Check `users.name` field is set (not null)

**Issue: Cookie not setting in SvelteKit**
- Must manually parse and set cookie from Better Auth response
- Use `cookies.set()` in SvelteKit API routes
- See `/src/routes/api/auth/register/+server.ts` for reference

---

## 20) Critical Implementation Notes

### Authentication & Session Management
**Dual-Mode Architecture:**
- Anonymous users: `sessionId` cookie (generated on first visit)
- Authenticated users: Better Auth session cookie + `userId`
- Catalogs: Support both `sessionId` and `userId` for seamless migration

**Catalog Migration on Signup:**
Location: `/src/lib/server/services/catalog-migration.ts`
- Automatically runs on user registration
- Migrates all anonymous catalogs to user account
- Returns count of migrated catalogs
- User sees confirmation message

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

## 21) Known Issues & TODOs

### Remove Before Production
- ColorCustomizer component in `+layout.svelte` (design tool, not user feature)

### Production Readiness Tasks
- ❌ Migrate file storage from `/static` to Cloudflare R2 or AWS S3
- ❌ Set up managed MySQL database (PlanetScale, Railway, or AWS RDS)
- ❌ Configure AUTH_SECRET with secure random string
- ❌ Enable HTTPS and set `useSecureCookies: true` in auth config
- ❌ Add email verification (currently disabled for V1)
- ❌ Set up error tracking (Sentry or similar)
- ❌ Add rate limiting to auth endpoints

### Missing Features (Phase 5)
- ❌ Sharing circles (invite-only groups)
- ❌ Share designs to circles
- ❌ Reactions/compliments on shared items
- ❌ Circle management UI

### File Storage Strategy
**Current (Development):** Local static files in `/static/uploads/` and `/static/pdfs/`
**Production Plan:** Cloudflare R2 (S3-compatible) with CDN
- Environment variables already defined in `.env.example`
- Migration path: Update image URLs from `/static/` to R2 public URLs

---

## 22) Quick Reference

### Key Files to Know

**Core Pages:**
- `/src/routes/upload/+page.svelte` - Upload + freeform crop (569 lines)
- `/src/routes/editor/+page.svelte` - Canvas editor with 6 tools (560 lines)
- `/src/routes/doll-builder/+page.svelte` - Template selection (247 lines)
- `/src/routes/doll-builder/place/+page.svelte` - Design placement (367 lines)
- `/src/routes/portfolio/+page.svelte` - Portfolio grid with stats (332 lines)
- `/src/routes/auth/register/+page.svelte` - Registration form (234 lines)
- `/src/routes/auth/login/+page.svelte` - Login form
- `/src/routes/onboarding/+page.svelte` - Post-signup onboarding

**API Endpoints:**
- `/src/routes/api/auth/register/+server.ts` - User registration + catalog migration (125 lines)
- `/src/routes/api/auth/login/+server.ts` - User login
- `/src/routes/api/auth/logout/+server.ts` - Session destruction
- `/src/routes/api/upload/+server.ts` - Image processing (113 lines)
- `/src/routes/api/generate-pdf/+server.ts` - PDF generation (40 lines)
- `/src/routes/api/catalogs/` - Catalog CRUD endpoints
- `/src/routes/api/designs/` - Design CRUD endpoints

**Authentication:**
- `/src/lib/server/auth/config.ts` - Better Auth configuration (48 lines)
- `/src/lib/server/auth/guards.ts` - Route protection utilities
- `/src/lib/server/auth/validation.ts` - Input validation
- `/src/hooks.server.ts` - Global auth middleware (32 lines)

**Services:**
- `/src/lib/services/pdf-generator.ts` - PDFKit service (378 lines)
- `/src/lib/server/services/catalog-migration.ts` - Catalog migration on signup
- `/src/lib/server/session.ts` - Anonymous session management
- `/src/lib/data/doll-templates.ts` - Template metadata (184 lines)

**Database:**
- `/src/lib/server/db/schema.ts` - Drizzle schema (261 lines)
- `/src/lib/server/db/index.ts` - DB client (20 lines)
- `/drizzle.config.ts` - Drizzle configuration

**Config:**
- `/svelte.config.js` - SvelteKit config (adapter-node)
- `/tailwind.config.js` - Tailwind + DaisyUI (Lemon Meringue theme)
- `/package.json` - Dependencies and scripts
- `/.env.example` - Environment variable template

### User Flow (Complete Path)

**Anonymous User Flow (No Account):**
1. **Upload:** `/upload` → drag/drop image → freeform crop → process
2. **Edit:** `/editor` → use 6 tools → apply patterns → save PNG
3. **Paper Doll:** Click "Create Paper Doll" → `/doll-builder` → select template
4. **Place:** `/doll-builder/place` → position design → adjust scale → choose paper size
5. **Download:** Click "Generate PDF" → download 2-page printable
6. **Catalogs:** Create fashion collections with sessionId (migrated on signup)

**Authenticated User Flow (With Account):**
1. **Register:** `/auth/register` → email + password + nickname → auto-login
2. **Onboarding:** `/onboarding` → welcome message → link to upload
3. **Upload:** `/upload` → drag/drop image → freeform crop → process → save to portfolio
4. **Portfolio:** `/portfolio` → view all designs → edit, delete, download, or make paper doll
5. **Edit:** Click "Edit" from portfolio → `/editor` → use 6 tools → save updates
6. **Paper Doll:** Click "Make Paper Doll" → `/doll-builder` → select template → place → generate PDF
7. **Catalogs:** Create fashion collections linked to user account (persistent across sessions)

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

## 23) Open Questions (Track but don't block)
- Age gating / COPPA compliance approach (V1 can avoid collecting personal data)
- Parent dashboard (V2)
- Advanced background removal model (V2)
- Real-time collaboration (V2)

---
