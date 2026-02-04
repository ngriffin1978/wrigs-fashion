# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Wrigs Fashion (V1)
**Project:** Web app for young girls who like to draw fashion designs
**V1 Theme:** Draw it → digitize it → make a printable paper doll (PDF)
**Primary goal:** A delightful, safe creative flow that works great on tablets and laptops.

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

## 5) Technical Plan (Actual Implementation)
**Web stack (implemented):**
- SvelteKit (with Svelte 5 runes) + TypeScript
- TailwindCSS + DaisyUI (Lemon Meringue theme)
- Drizzle ORM + MySQL (schema defined, not yet connected)
- Auth: Lucia Auth (planned, not yet implemented)
- Object storage: Local static/uploads (Supabase Storage or R2 for production)
- Image processing: server-side Sharp.js with color normalization
- PDF generation: PDFKit (planned, not yet implemented)

**Architecture notes:**
- Heavy processing server-side (image cleanup: 2-4 seconds typical)
- Synchronous processing with 10MB file size limit
- Client-side canvas editor for real-time drawing tools
- Static file serving for processed images

---

## 6) Data Model (Initial Draft)
### User
- id, email, nickname, avatarUrl, createdAt

### Design
- id, userId, title
- originalImageUrl
- cleanedImageUrl
- coloredOverlayUrl (optional)
- createdAt, updatedAt

### DollTemplate
- id, name, pose, baseImageUrl
- printableBasePdfUrl (optional pre-render)
- regions: JSON (where outfits should fit)

### DollProject (generated printable set)
- id, userId, designId, dollTemplateId
- pieces: JSON (top/bottom/dress/accessories placements)
- pdfUrl (generated)
- createdAt

### Circle
- id, ownerId, name, inviteCode, createdAt

### CircleMember
- id, circleId, userId, role

### SharedItem
- id, circleId, itemType ("design" | "dollProject"), itemId, createdAt

### Reaction
- id, userId, sharedItemId, reactionType, createdAt

### Compliment
- id, userId, sharedItemId, complimentType, createdAt

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
1) ✅ Repo scaffolding + auth + DB + storage (partial: DB schema defined, local storage working)
2) ✅ Upload + portfolio listing (upload done, portfolio needs implementation)
3) ✅ Image cleanup pipeline (server) - Sharp.js with color normalization
4) ✅ Coloring/pattern overlay (client) - 6 drawing tools implemented
5) ✅ Doll template selection + placement UI - 6 templates with live preview
6) ✅ PDF generation endpoint - PDFKit with 2-page output
7) 📋 Circles + sharing + reactions/compliments (needs auth first)
8) 📋 Polish: onboarding, empty states, print QA

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
- ESLint + Prettier for consistency
- Functional components with hooks (no class components)

### File Organization
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - React components (grouped by feature)
- `/src/lib/` - Utilities, services, and business logic
  - `/lib/config/` - Centralized configuration
  - `/lib/services/` - Image processing, PDF generation, storage
  - `/lib/db/` - Prisma client and database utilities
- `/prisma/` - Database schema and migrations
- `/public/` - Static assets (doll templates, pattern overlays)

### Naming Conventions
- Components: PascalCase (e.g., `DesignEditor.tsx`)
- Utilities: camelCase (e.g., `imageProcessor.ts`)
- API routes: kebab-case folders (e.g., `api/paper-dolls/`)

### Environment Variables
- Use `.env.local` for local development
- Required vars: `DATABASE_URL`, `STORAGE_BUCKET`, `NEXTAUTH_SECRET`
- Document all env vars in `.env.example`

### Testing
- Test image upload with various file types (jpg, png, heic)
- Test PDF generation with Letter and A4 sizes
- Test on tablet viewports (768px, 1024px)

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

# 2. Configure environment variables (optional for V1)
cp .env.example .env
# Edit .env with database URL if needed (not required for Phase 1)

# 3. Start development server
npm run dev
# App runs on http://localhost:3001 (port 3000 was in use)
```

**Current Phase Status:**
- ✅ Phase 1 Complete: Upload + Crop + Processing + Editor
- ✅ Phase 2 Complete: Paper Doll Templates + PDF Generation
- 📋 Phase 3 Next: Authentication + Database Integration
- 📋 Phase 4 Future: Portfolio CRUD + Sharing

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
npm run db:push      # Push schema changes directly (dev only)
npm run db:studio    # Open Drizzle Studio (database GUI)
```

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
- Unit tests: Vitest for utilities
- Component tests: Playwright Component Testing
- E2E tests: Playwright for critical flows
- Visual tests: Image/PDF regression testing

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

### API Routes Organization
```
/src/routes/api/
  ✅ upload/+server.ts - Image upload and processing (113 lines)
  ✅ generate-pdf/+server.ts - PDF generation (40 lines)
  ✅ catalogs/ - Catalog CRUD endpoints
  📋 designs/ - CRUD for designs (planned, needs auth first)
  📋 circles/ - Sharing and circles (planned)
```

### Component Organization
```
/src/routes/
  ✅ upload/+page.svelte - Upload + freeform crop tool (569 lines)
  ✅ editor/+page.svelte - Canvas editor with 6 tools + "Create Paper Doll" button (560 lines)
  ✅ doll-builder/+page.svelte - Paper doll template selection (247 lines)
  ✅ doll-builder/place/+page.svelte - Design placement UI with live preview (367 lines)
  ✅ catalogs/+page.svelte - Catalog management
  ✅ +page.svelte - Homepage
  ✅ +layout.svelte - Navigation + footer
  📋 portfolio/+page.svelte - Portfolio (needs implementation)

/src/lib/components/
  ✅ ColorCustomizer.svelte - Design tool (should be removed from production)
```

---

## 16) Hosting (Affordable)
Initial recommendation:
- Vercel for web app
- Supabase for Postgres + Storage + Auth
OR
- Cloudflare Pages + R2 + Neon (if optimizing cost)

---

## 17) Open Questions (Track but don't block)
- Age gating / COPPA compliance approach (V1 can avoid collecting personal data)
- Parent dashboard (V2)
- Multiple doll templates (V1.1)
- Advanced background removal model (V2)

---
