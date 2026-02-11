# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Wrigs Fashion (V1)
**Project:** Web app for young girls who like to draw fashion designs
**V1 Theme:** Draw it → digitize it → make a printable paper doll (PDF)
**Primary goal:** A delightful, safe creative flow that works great on tablets and laptops.

**Current Status:** Phase 5 Complete (Circles + Sharing System)
**Next Phase:** Polish & Deploy (Phase 6)

**Recent Fix (2026-02-11):** Resolved critical database compatibility issue
- Fixed LATERAL join errors in catalog API endpoints
- Updated Docker configuration to use external MySQL 8.0 database
- Application now fully operational with all features working

---

## 1) Product Summary

Wrigs Fashion is a web app where kids can:
1. Upload a photo of a hand-drawn fashion sketch (phone/tablet photo)
2. Clean it up (crop, straighten, remove background, enhance lines)
3. Color / add simple patterns digitally
4. Place the design on a paper doll template
5. Export a printable PDF (doll + outfit cutouts with cut lines + tabs)
6. Save to a private portfolio and optionally share within invite-only friend circles

**Non-goals (V1):**
- No public social feed
- No AI-generated clothing from text prompts
- No complex pose estimation / body mapping
- No real-time multiplayer editing

---

## 2) Target User + Safety

**Primary users:** kids (~7–13) who like drawing fashion.
**Safety baseline:**
- Invite-only "Circles" (closed groups). Default: private portfolio only.
- Kid-friendly comments: reactions + preset compliments only (no free text).
- Minimal personal data collection. Use a nickname and avatar, not full names.

---

## 3) MVP Feature Set

**Completed for V1:**
- ✅ Auth: Better Auth with email/password
- ✅ Upload image with drag-and-drop
- ✅ Crop/rotate + cleanup pipeline
- ✅ Basic coloring/pattern overlay
- ✅ Paper doll template placement (6 templates: 2 poses × 3 body types)
- ✅ PDF export (Letter + A4)
- ✅ Portfolio CRUD (create/list/view/delete)
- ✅ Achievement badges and stats
- ✅ Basic Circles (invite-only) + sharing
- ✅ Reactions + preset compliments
- ✅ Docker deployment setup

**Remaining for V1:**
- 📋 Deploy to production (managed DB + object storage)
- 📋 Production polish (error handling, empty states, loading states)

---

## 4) Technical Stack

**Web stack:**
- SvelteKit (with Svelte 5 runes) + TypeScript
- TailwindCSS + DaisyUI (Lemon Meringue theme)
- Drizzle ORM + **MySQL 8.0+** (✅ connected and operational - REQUIRES MySQL 8.0+ or MariaDB 10.6.1+)
- Auth: Better Auth (✅ implemented with email/password)
- Object storage: Local static files (production TBD: Cloudflare R2)
- Image processing: Sharp.js (server-side)
- PDF generation: PDFKit (✅ implemented)
- Deployment: adapter-node (Node.js server) with Docker

**Key Architecture Decisions:**
- Better Auth with email/password authentication (cookie-based sessions)
- Dual-mode system: sessionId for anonymous users, userId for authenticated users
- Automatic catalog migration from sessionId to userId on registration
- Image processing server-side (2-4 seconds, 10MB limit)
- Synchronous API endpoints (no background jobs yet)
- Canvas-based editor for real-time drawing
- Static file serving from `/static` directory

---

## 5) Data Model (Brief Overview)

**Schema Location:** `src/lib/server/db/schema.ts`

**Core Tables:**
- `users` - User accounts (email, nickname, avatarUrl)
- `designs` - Fashion sketches (originalImageUrl, cleanedImageUrl, coloredOverlayUrl)
- `dollTemplates` - Paper doll bases (6 templates with regions)
- `dollProjects` - Generated PDFs (links design + template)
- `catalogs` - Fashion collections (sessionId/userId, shareSlug)
- `catalogItems` - Images on catalog canvas (position, size, rotation)

**Sharing Tables:**
- `circles` - Invite-only groups (ownerId, inviteCode)
- `circleMembers` - Membership (circleId, userId, role)
- `sharedItems` - Shared designs/dolls (circleId, itemType, itemId)
- `reactions` - Emoji reactions (userId, sharedItemId, reactionType)
- `compliments` - Preset phrases (userId, sharedItemId, complimentType)

**Key Patterns:**
- Use `nanoid()` for all IDs (URL-safe, collision-resistant)
- Invite codes: 8-character uppercase alphanumeric with collision retry
- Dual-mode: Support both sessionId and userId for catalogs
- Cascade deletes: user → designs → dollProjects, circle → members/sharedItems

See `src/lib/server/db/schema.ts` for complete schema details.

---

## 6) Technical Constraints & Limits

### Image Processing
- Max upload size: 10MB
- Supported formats: JPG, PNG, HEIC/HEIF (iOS photos)
- Processing timeout: 30 seconds
- Max dimension after resize: 2000px

### PDF Generation
- Page sizes: US Letter (8.5×11) and A4 (210×297mm)
- Safe print margins: 0.5 inch / 12.7mm
- Max file size: 5MB per PDF

### Performance Targets
- Image cleanup: <5 seconds for typical sketch photo
- PDF generation: <10 seconds including storage upload
- Portfolio page load: <2 seconds

---

## 7) Claude Code Instructions

When implementing, Claude should:
- Keep V1 scope tight and avoid speculative features.
- Prefer simple, reliable solutions over complex AI.
- Provide runnable code, migrations, and minimal config.
- Follow Svelte 5 runes syntax (`$state`, `$derived`, `$effect`).
- Use event handlers: `onchange={handler}` NOT `on:change={handler}`.
- TypeScript strict mode enabled.
- Functional style (no class components).

**Key questions Claude should ask only if blocked:**
- Which auth approach? → **Already decided: Better Auth**
- Which storage? → **Dev: local static files, Prod: Cloudflare R2**
- Letter-only vs both Letter and A4? → **Both (already implemented)**

---

## 8) Repo Conventions

### Code Style
- TypeScript strict mode enabled
- **Svelte 5 runes:** Use `$state`, `$derived`, `$effect` (not Svelte 4 syntax)
- Event handlers: Use `onchange={handler}` NOT `on:change={handler}`
- Functional style (no class components)

### File Organization
```
src/
├── routes/                    # Pages and API routes
│   ├── +page.svelte          # Homepage
│   ├── +layout.svelte        # Root layout
│   ├── upload/               # Upload flow
│   ├── editor/               # Canvas editor
│   ├── doll-builder/         # Paper doll system
│   ├── catalogs/             # Catalog system
│   ├── portfolio/            # Portfolio (auth required)
│   ├── circles/              # Circles (auth required)
│   └── api/                  # API endpoints (see docs/API.md)
├── lib/
│   ├── components/           # Reusable Svelte components
│   │   ├── catalog/          # Catalog-specific components
│   │   └── circles/          # Circle-specific components
│   ├── services/             # Business logic
│   │   └── pdf-generator.ts  # PDFKit service
│   ├── data/
│   │   └── doll-templates.ts # Template metadata
│   ├── utils/                # Utilities
│   │   ├── invite-codes.ts   # Invite code generation
│   │   └── circle-permissions.ts # Permission checks
│   └── server/               # Server-only code
│       ├── session.ts        # Session management
│       ├── auth/             # Better Auth config
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
AUTH_SECRET="your_32_character_random_secret_key"
PUBLIC_APP_URL="https://yourdomain.com"
BETTER_AUTH_URL="https://yourdomain.com"  # Optional, defaults to PUBLIC_APP_URL
```

---

## 9) Authentication System

**Status:** ✅ IMPLEMENTED

**Authentication Provider:** Better Auth (v1.4.18)
- Email/password authentication
- Cookie-based sessions (30-day expiry)
- Server-side session validation via `hooks.server.ts`
- No email verification in V1 (optional for V2)

**Key Files:**
- `/src/lib/server/auth/config.ts` - Better Auth configuration
- `/src/lib/server/auth/guards.ts` - Route protection utilities
- `/src/hooks.server.ts` - Global auth middleware
- `/src/app.d.ts` - TypeScript types for `event.locals.user`

**Dual-Mode System:**
- **Anonymous users:** Use `sessionId` cookie for catalog access
- **Authenticated users:** Use `userId` from Better Auth session
- **On signup:** Automatic migration of sessionId catalogs to userId

**Protected Routes:**
- `/portfolio` - Requires authentication
- `/circles` - Requires authentication
- `/onboarding` - Requires authentication
- Other routes: Public (upload, editor, doll-builder work anonymously)

**For detailed Better Auth implementation guide, see `docs/BETTER_AUTH.md`.**

---

## 10) Critical Implementation Notes

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

6 templates hardcoded in TypeScript (not in DB):
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

### Circle & Sharing System
**Location:** Multiple files (see Phase 5)

**Key Architecture:**
- **Invite Codes:** 8-character uppercase alphanumeric (e.g., "ABCD1234")
- **Collision Prevention:** Retry logic (up to 5 attempts) with uniqueness check
- **Case-Insensitive Matching:** Codes normalized to uppercase before lookup
- **Membership Roles:** Owner (cannot leave, must delete circle) vs Member (can leave)

**Sharing Flow:**
1. User creates/owns/joins circles
2. From portfolio: "Share to Circle" → multi-select modal
3. Batch API: Share to multiple circles at once (`POST /api/share`)
4. Shared item stored with `itemType` (design/doll) and `itemId`
5. Feed loads with **hydrated data** (design/doll details)

**Reactions & Compliments:**
- **6 emoji reactions:** ❤️ 😍 👏 ✨ 🔥 😊
- **5 preset compliments:** "So creative!", "Love it!", "Amazing!", "Beautiful!", "Awesome!"
- Toggle behavior: Click again to remove reaction
- Stored with userId to prevent duplicates
- Displayed with user avatars

**Safety Features:**
- Invite-only (no public discovery)
- Owner controls (can remove members/items)
- No free-text comments (preset only)
- Orphaned shares cleanup (when design deleted)

---

## 11) Known Issues & TODOs

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

### File Storage Strategy
**Current (Development):** Local static files in `/static/uploads/` and `/static/pdfs/`
**Production Plan:** Cloudflare R2 (S3-compatible) with CDN
- Environment variables already defined in `.env.example`
- Migration path: Update image URLs from `/static/` to R2 public URLs

---

## 12) Key Files Reference

**Core Pages:**
- `/src/routes/upload/+page.svelte` - Upload + freeform crop (569 lines)
- `/src/routes/editor/+page.svelte` - Canvas editor with 6 tools (560 lines)
- `/src/routes/doll-builder/+page.svelte` - Template selection (247 lines)
- `/src/routes/doll-builder/place/+page.svelte` - Design placement (367 lines)
- `/src/routes/portfolio/+page.svelte` - Portfolio grid with stats (332 lines)
- `/src/routes/circles/+page.svelte` - Circles listing grid
- `/src/routes/circles/[id]/+page.svelte` - Circle detail with feed

**Key Services:**
- `/src/lib/services/pdf-generator.ts` - PDFKit service (378 lines)
- `/src/lib/server/services/catalog-migration.ts` - Catalog migration on signup
- `/src/lib/data/doll-templates.ts` - Template metadata (184 lines)

**Database:**
- `/src/lib/server/db/schema.ts` - Drizzle schema (261 lines)
- `/src/lib/server/db/index.ts` - DB client (20 lines)

**Auth:**
- `/src/lib/server/auth/config.ts` - Better Auth configuration (48 lines)
- `/src/hooks.server.ts` - Global auth middleware (32 lines)

---

## 13) Deployment

### Docker Deployment (✅ Implemented)

Complete Docker setup for containerized deployment. See `DOCKER_DEPLOYMENT.md` for full documentation.

**Quick Start:**
```bash
./docker-run.sh  # Builds image, generates secrets, starts container
```

**Access:**
- HTTPS: https://localhost:443
- HTTP: http://localhost:80 (redirects to HTTPS)

### Production Hosting (Planned)
Initial recommendation:
- Vercel for web app
- Supabase for Postgres + Storage + Auth
OR
- Cloudflare Pages + R2 + Neon (if optimizing cost)

---

## 14) Additional Documentation

For more detailed information, see:
- **Setup & Development:** `docs/SETUP.md` - Complete setup guide, commands, troubleshooting
- **API Reference:** `docs/API.md` - All API endpoints with request/response formats
- **Better Auth Guide:** `docs/BETTER_AUTH.md` - Detailed Better Auth implementation guide

---

## 15) Open Questions (Track but don't block)
- Age gating / COPPA compliance approach (V1 can avoid collecting personal data)
- Parent dashboard (V2)
- Advanced background removal model (V2)
- Real-time collaboration (V2)

---
