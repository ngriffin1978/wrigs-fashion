# Project Handoff Document - Wrigs Fashion
**Last Updated:** 2026-02-11
**Status:** Phase 5 Complete + Critical Database Fix
**Next Phase:** Phase 6 - Polish & Deploy to Production

---

## 🎯 Current Status

### Project Phase: Phase 5 Complete ✅
**All core V1 features implemented:**
- ✅ Authentication (Better Auth with email/password)
- ✅ Image upload with HEIC/HEIF support
- ✅ Crop/rotate + cleanup pipeline
- ✅ Canvas editor (6 tools: brush, spray paint, glitter, stamp, magic wand, eraser)
- ✅ Paper doll templates (6 templates: 2 poses × 3 body types)
- ✅ PDF export (Letter + A4 formats)
- ✅ Portfolio CRUD (create/list/view/delete)
- ✅ Achievement badges and stats
- ✅ Circles (invite-only groups)
- ✅ Sharing system with reactions + preset compliments
- ✅ Docker deployment setup
- ✅ Catalog system (fashion collections on canvas)

### Recently Completed (2026-02-11) - CRITICAL FIX
🔧 **Fixed database compatibility issue that was preventing catalog API from working**

**Problem:** Application was experiencing "Failed query" errors on `/api/catalogs` endpoints

**Root Causes:**
1. **LATERAL Join Incompatibility:** Drizzle ORM was generating MySQL-style LATERAL joins, but the Docker container had MariaDB 10.5 which doesn't support this feature (added in MariaDB 10.6.1)
2. **Hardcoded Database URL:** The supervisord configuration was hardcoding `DATABASE_URL=localhost:3306` (internal MariaDB), overriding the docker-compose environment variable that pointed to the external MySQL 8.0 database

**Solutions Implemented:**
1. Rewrote catalog API queries to avoid LATERAL joins by fetching items separately using `inArray()`
2. Updated `docker/supervisord.conf` to use environment variables: `DATABASE_URL="%(ENV_DATABASE_URL)s"`
3. Configured `docker-compose.yml` to connect to external MySQL 8.0 database
4. Removed internal MariaDB volume from docker-compose (now uses external database)

**Commit:** `9c36b12` - "fix: MySQL 8.0 compatibility and Docker database configuration"

**Verification:**
- ✅ Catalog API endpoints now return correct responses
- ✅ Data is being written to external MySQL 8.0 database
- ✅ No more "Failed query" or LATERAL join errors
- ✅ Application logs are accessible and properly formatted

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** SvelteKit (Svelte 5 with runes) + TypeScript
- **Styling:** TailwindCSS + DaisyUI (Lemon Meringue theme)
- **Database:** MySQL 8.0 (Drizzle ORM) **← CRITICAL: Must be MySQL 8.0+ or MariaDB 10.6.1+**
- **Auth:** Better Auth v1.4.18 (email/password, cookie-based sessions, 30-day expiry)
- **Image Processing:** Sharp.js (server-side, supports HEIC/HEIF from iOS)
- **PDF Generation:** PDFKit (2-page layout with cut lines and fold tabs)
- **Deployment:** Docker (adapter-node, Node.js server with nginx + supervisord)

### Database Configuration ⚠️ CRITICAL
**The application requires MySQL 8.0+ or MariaDB 10.6.1+ for full compatibility.**

**Why:** Drizzle ORM generates optimized queries for modern MySQL. Using older versions (especially MariaDB 10.5) will cause "Failed query" errors due to missing SQL features.

**Current Setup:**
- **External MySQL 8.0 container:** `wrigs-fashion-db-dev`
- **Connection string:** `mysql://wrigs_user:password@wrigs-fashion-db-dev:3306/wrigs_fashion`
- **Configured in:**
  - `docker-compose.yml` (environment variable)
  - `docker/supervisord.conf` (uses environment variable interpolation)

---

## 🚀 Getting Started

### Start the Application
```bash
cd /root/projects/wrigs-fashion

# Start all services (both app and database containers)
docker compose up -d

# Check container status
docker ps

# View real-time logs
docker logs wrigs-fashion --follow
```

### Access Points
- **HTTPS:** https://localhost:443 (self-signed certificate - browser will warn)
- **HTTP:** http://localhost:80 (redirects to HTTPS)
- **External MySQL:** localhost:3306 (wrigs-fashion-db-dev container)

### Viewing Application Logs
```bash
# Application error logs (API errors, exceptions)
docker exec wrigs-fashion tail -f /var/log/supervisor/sveltekit_error.log

# Application stdout logs (console.log statements)
docker exec wrigs-fashion tail -f /var/log/supervisor/sveltekit.log

# Filter for specific API endpoint
docker exec wrigs-fashion tail -f /var/log/supervisor/sveltekit_error.log | grep --line-buffered "/api/catalogs"

# All services combined (nginx, mysql, sveltekit)
docker logs wrigs-fashion --follow

# Specific service logs
docker exec wrigs-fashion tail -f /var/log/supervisor/nginx_error.log
docker exec wrigs-fashion tail -f /var/log/supervisor/mysql.log
```

### Database Access
```bash
# Connect to external MySQL database
docker exec wrigs-fashion-db-dev mysql -uwrigs_user -ppassword wrigs_fashion

# View all tables
docker exec wrigs-fashion-db-dev mysql -uwrigs_user -ppassword wrigs_fashion -e "SHOW TABLES;"

# Check catalog data
docker exec wrigs-fashion-db-dev mysql -uwrigs_user -ppassword wrigs_fashion -e "SELECT * FROM catalogs LIMIT 5;"

# Run migrations (if needed)
docker exec wrigs-fashion /usr/local/bin/run-migrations.sh
```

---

## 📋 Feature Completion Status

### ✅ Phase 1: Upload & Image Processing (Complete)
- Image upload with drag-and-drop
- HEIC/HEIF format support (iOS photos)
- Freeform crop tool
- Background removal and enhancement
- Sharp.js processing pipeline (posterize to 32 colors for Magic Wand)
- Max 10MB upload size

### ✅ Phase 2: Canvas Editor (Complete)
- 6 creative tools:
  1. Brush (variable size)
  2. Spray Paint (particle effect)
  3. Glitter (sparkle overlay)
  4. Stamp (repeating patterns)
  5. Magic Wand (flood fill - works well with 32-color posterization)
  6. Eraser
- Pattern overlays: dots, stripes, stars, hearts, sparkles
- Color picker
- Undo/redo functionality

### ✅ Phase 3: Paper Doll System (Complete)
- 6 inclusive templates (2 poses × 3 body types)
  - Pose A: Arms out (great for jackets/accessories)
  - Pose B: Arms down (great for dresses/flowing designs)
  - Body types: Classic Build, Curvy Build, Petite Build
- Template selection with filters (pose + body type)
- Interactive placement canvas (drag, scale, rotate)
- PDF generation with PDFKit:
  - 2-page layout (doll base + outfit piece)
  - Cut lines (dashed #999 gray)
  - Fold tabs with labels
  - Letter (8.5×11) and A4 (210×297mm) support
  - Safe print margins (0.5 inch / 12.7mm)

### ✅ Phase 4: Authentication & Portfolio (Complete)
- Better Auth integration (email/password)
- User registration and login
- Cookie-based sessions (30-day expiry)
- Protected routes (portfolio, circles)
- Dual-mode system:
  - Anonymous users: sessionId cookie
  - Authenticated users: userId from session
  - Automatic catalog migration on signup
- Portfolio CRUD:
  - View all saved designs
  - Delete designs with confirmation
  - Achievement badges (First Upload, Colorful Creator, etc.)
  - Stats tracking (designs created, dolls made, items shared)

### ✅ Phase 5: Circles & Sharing (Complete)
- Invite-only groups (8-character uppercase alphanumeric codes)
- Circle creation with collision prevention
- Circle membership (Owner role cannot leave, must delete circle)
- Share designs/dolls to multiple circles
- Batch sharing API
- Feed with hydrated data (design/doll details)
- Reactions: 6 emoji types (❤️ 😍 👏 ✨ 🔥 😊)
- Compliments: 5 preset phrases (toggle behavior)
- Safety features:
  - No public discovery
  - Owner controls (remove members/items)
  - No free-text comments (presets only)

### ✅ Phase 5.5: Catalog System (Complete)
- Fashion collections on canvas
- Drag images from portfolio
- Position, scale, and rotate items
- Background color customization
- Background pattern overlays
- Save/load catalog state
- Share catalogs via unique slug
- Public/private toggle
- **Recently Fixed:** MySQL 8.0 compatibility (removed LATERAL joins)

---

## 📋 Phase 6: Polish & Deploy (Next Steps)

### High Priority
- [ ] **Deploy to production** with managed infrastructure
  - [ ] Migrate to managed MySQL (PlanetScale, Railway, AWS RDS, or similar)
  - [ ] Set up object storage (Cloudflare R2 or AWS S3) for images/PDFs
  - [ ] Configure production domain with HTTPS
  - [ ] Set up proper AUTH_SECRET (32-character random string)
  - [ ] Enable `useSecureCookies: true` in auth config
  - [ ] Update PUBLIC_APP_URL to production domain

- [ ] **Production polish**
  - [ ] Comprehensive error handling with user-friendly messages
  - [ ] Loading states for all async operations
  - [ ] Empty states for portfolio, circles, catalogs
  - [ ] Form validation with helpful error messages
  - [ ] Toast notifications for success/error feedback
  - [ ] Skeleton loaders for data fetching

- [ ] **Performance optimization**
  - [ ] Image optimization (lazy loading, responsive images)
  - [ ] Code splitting
  - [ ] Bundle size analysis
  - [ ] Lighthouse audit and fixes

### Medium Priority
- [ ] Email verification system (currently disabled for V1)
- [ ] Error tracking (Sentry or similar)
- [ ] Rate limiting on auth endpoints
- [ ] Analytics (privacy-friendly, COPPA-compliant)
- [ ] Remove ColorCustomizer from `+layout.svelte` (design tool, not user feature)

### Low Priority / Future (V2)
- [ ] Age gating / COPPA compliance
- [ ] Parent dashboard
- [ ] Advanced background removal (AI-powered)
- [ ] Real-time collaboration
- [ ] Mobile app (React Native or Flutter)
- [ ] OAuth providers (Google, Apple)

---

## 🔧 Technical Details

### Critical Implementation Notes

#### 1. Catalog API - MySQL 8.0 Compatibility Fix
**Files Modified:**
- `/src/routes/api/catalogs/+server.ts`
- `/src/routes/api/catalogs/[id]/+server.ts`

**Problem:** Drizzle ORM's `with: { items: true }` generated LATERAL joins (not supported in MariaDB 10.5)

**Solution:** Fetch catalog items separately using `inArray()`:
```typescript
// Fetch catalogs without LATERAL joins
const catalogList = await db
  .select()
  .from(catalogs)
  .where(whereClause)
  .orderBy(desc(catalogs.updatedAt));

// Fetch all items in a single query
const catalogIds = catalogList.map((c) => c.id);
const allItems = catalogIds.length > 0
  ? await db.select().from(catalogItems).where(inArray(catalogItems.catalogId, catalogIds))
  : [];

// Group items by catalog ID
const itemsByCatalogId = allItems.reduce((acc, item) => {
  if (!acc[item.catalogId]) acc[item.catalogId] = [];
  acc[item.catalogId].push(item);
  return acc;
}, {} as Record<string, typeof allItems>);

// Combine catalogs with their items
const results = catalogList.map((catalog) => ({
  ...catalog,
  items: itemsByCatalogId[catalog.id] || []
}));
```

#### 2. Docker Configuration - Environment Variables
**File Modified:** `/docker/supervisord.conf`

**Problem:** Hardcoded `DATABASE_URL` was overriding docker-compose environment variables

**Solution:** Use supervisord's environment variable interpolation:
```ini
[program:sveltekit]
command=node build
directory=/app
environment=NODE_ENV="production",DATABASE_URL="%(ENV_DATABASE_URL)s",AUTH_SECRET="%(ENV_AUTH_SECRET)s",PUBLIC_APP_URL="%(ENV_PUBLIC_APP_URL)s",PORT="3000",BODY_SIZE_LIMIT="15728640"
```

**File Modified:** `/docker-compose.yml`
```yaml
services:
  wrigs-fashion:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://wrigs_user:password@wrigs-fashion-db-dev:3306/wrigs_fashion
      - PUBLIC_APP_URL=https://localhost
      - AUTH_SECRET=${AUTH_SECRET:-}
    networks:
      - default
      - wrigs-network  # Connect to external database network

networks:
  wrigs-network:
    external: true
    name: wrigs-fashion_wrigs-network
```

#### 3. Authentication System (Better Auth)
**Location:** `/src/lib/server/auth/config.ts`

**Features:**
- Email/password authentication
- Cookie-based sessions (30-day expiry)
- Server-side session validation via `hooks.server.ts`
- Dual-mode support (anonymous + authenticated users)

**Protected Routes:**
- `/portfolio` - Requires authentication
- `/circles` - Requires authentication
- `/onboarding` - Requires authentication

**Dual-Mode Architecture:**
- Anonymous users use `sessionId` cookie for catalog access
- Authenticated users use `userId` from Better Auth session
- On signup: automatic migration of sessionId catalogs to userId

**Migration Service:** `/src/lib/server/services/catalog-migration.ts`

#### 4. Image Processing Pipeline
**Location:** `/src/routes/api/upload/+server.ts`

Multi-step Sharp.js pipeline:
1. Resize to max 2000px (maintain aspect ratio)
2. Brightness boost (1.4x)
3. Saturation boost (1.5x)
4. Normalize (push background toward white)
5. Posterize to 32 colors (helps Magic Wand tool)
6. Sharpen edges
7. Add neutral gray padding (#f8f8f8)

**Max upload size:** 10MB
**Supported formats:** JPG, PNG, HEIC/HEIF (iOS photos)
**Processing timeout:** 30 seconds
**Max dimension:** 2000px

**Why posterize to 32 colors?** Makes the Magic Wand flood fill tool effective by consolidating similar colors into distinct regions.

#### 5. PDF Generation Service
**Location:** `/src/lib/services/pdf-generator.ts` (378 lines)

PDFKit-based service generates 2-page PDFs:
- **Page 1:** Paper doll base with cut lines and fold tab
- **Page 2:** Outfit piece with user's design, tabs, and cut lines

**Technical specs:**
- Safe print margins: 0.5 inch / 12.7mm
- Dashed cut lines: `dash(5, 3)` with `#999` color
- Tab labels: Small "fold" text (8pt font)
- Footer: "✨ Made with Wrigs Fashion ✨"
- Supports Letter (8.5×11 inch) and A4 (210×297mm)
- Max file size: 5MB per PDF

#### 6. Paper Doll Template System
**Location:** `/src/lib/data/doll-templates.ts` (184 lines)

6 templates hardcoded in TypeScript (not in database):
- 2 poses (A: arms out, B: arms down)
- 3 body types (Classic, Curvy, Petite)
- Each has defined regions: top, bottom, dress, shoes
- Regions use coordinate system: `{x, y, width, height}`

**Why hardcoded?** Simplifies V1 architecture. Can migrate to database in future versions if templates become dynamic.

#### 7. Circle & Sharing System
**Key Files:**
- `/src/lib/utils/invite-codes.ts` - Code generation
- `/src/lib/utils/circle-permissions.ts` - Permission checks
- `/src/routes/circles/+page.svelte` - Circles listing
- `/src/routes/circles/[id]/+page.svelte` - Circle detail with feed

**Invite Code Architecture:**
- 8-character uppercase alphanumeric (e.g., "ABCD1234")
- Collision prevention with retry logic (up to 5 attempts)
- Case-insensitive matching (normalized to uppercase)
- Uniqueness validated before insertion

**Membership Roles:**
- **Owner:** Cannot leave circle (must delete entire circle)
- **Member:** Can leave at any time

**Sharing Flow:**
1. User creates/joins circles
2. From portfolio: "Share to Circle" → multi-select modal
3. Batch API: `/api/share` (share to multiple circles at once)
4. Shared items stored with `itemType` (design/doll) and `itemId`
5. Feed loads with **hydrated data** (includes full design/doll details)

**Reactions & Compliments:**
- **6 emoji reactions:** ❤️ 😍 👏 ✨ 🔥 😊
- **5 preset compliments:** "So creative!", "Love it!", "Amazing!", "Beautiful!", "Awesome!"
- Toggle behavior: Click again to remove
- Unique constraint prevents duplicate reactions (userId + sharedItemId + reactionType)
- Displayed with user avatars

**Safety Features:**
- Invite-only (no public discovery)
- Owner controls (can remove members/shared items)
- No free-text comments (preset reactions + compliments only)
- Orphaned shares cleanup (when design deleted, removes associated shared items)

---

## 🐛 Known Issues & Resolutions

### ✅ Resolved Issues

#### 1. LATERAL Join Errors (Fixed 2026-02-11)
**Status:** RESOLVED
**Commit:** `9c36b12`

**Symptom:** "Failed query" errors on catalog API endpoints
**Cause:** Drizzle ORM generating LATERAL joins not supported by MariaDB 10.5
**Solution:** Rewrote queries to fetch items separately using `inArray()`

#### 2. Database Connection Issue (Fixed 2026-02-11)
**Status:** RESOLVED
**Commit:** `9c36b12`

**Symptom:** App connecting to internal MariaDB 10.5 instead of external MySQL 8.0
**Cause:** Hardcoded DATABASE_URL in supervisord.conf
**Solution:** Updated supervisord to use environment variable interpolation

---

## 💾 Database Schema

**Location:** `/src/lib/server/db/schema.ts` (326 lines)

### Core Tables
- `users` - User accounts (email, name, image, role)
- `designs` - Fashion sketches (originalImageUrl, cleanedImageUrl, coloredOverlayUrl)
- `dollTemplates` - Paper doll bases (6 templates with regions JSON)
- `dollProjects` - Generated PDFs (designId, dollTemplateId, pieces JSON, pdfUrl)
- `catalogs` - Fashion collections (sessionId/userId, title, shareSlug, backgroundColor, backgroundPattern)
- `catalogItems` - Images on catalog canvas (catalogId, imageUrl, positionX, positionY, width, height, rotation, zIndex)

### Sharing Tables
- `circles` - Invite-only groups (ownerId, name, inviteCode)
- `circleMembers` - Membership (circleId, userId, role: 'owner'/'member')
- `sharedItems` - Shared designs/dolls (circleId, itemType: 'design'/'dollProject', itemId, sharedBy)
- `reactions` - Emoji reactions (userId, sharedItemId, reactionType)
- `compliments` - Preset phrases (userId, sharedItemId, complimentType)

### Auth Tables
- `sessions` - Better Auth session management (userId, expiresAt, ipAddress, userAgent)
- `accounts` - OAuth providers (future: Google, Apple - currently unused)
- `verifications` - Email verification tokens (optional V1, currently unused)

### Key Patterns
- All IDs use `nanoid()` (URL-safe, collision-resistant)
- Invite codes: 8-character uppercase alphanumeric with collision retry
- Dual-mode: Support both `sessionId` and `userId` for catalogs
- Cascade deletes: user → designs → dollProjects, circle → members/sharedItems

---

## 🌐 Environment Variables

### Development (.env)
```bash
# Database
DATABASE_URL="mysql://wrigs_user:password@localhost:3306/wrigs_fashion"

# Authentication
AUTH_SECRET="3b56aae4402660fadd3ec79d6cb629064c560af0287798284ccf659931066367"

# Application
PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3001"  # Optional, defaults to PUBLIC_APP_URL
NODE_ENV="development"
```

### Docker Production (docker-compose.yml)
```bash
# Database
DATABASE_URL="mysql://wrigs_user:password@wrigs-fashion-db-dev:3306/wrigs_fashion"

# Authentication
AUTH_SECRET="${AUTH_SECRET:-}"  # Generate with: openssl rand -hex 32

# Application
PUBLIC_APP_URL="https://localhost"
NODE_ENV="production"
```

### Production Deployment
**Before deploying to production:**
1. Update `DATABASE_URL` with managed database credentials (PlanetScale, Railway, AWS RDS)
2. Generate secure `AUTH_SECRET` (32 bytes hex): `openssl rand -hex 32`
3. Set `PUBLIC_APP_URL` to production domain (e.g., `https://wrigsfashion.com`)
4. Enable `useSecureCookies: true` in Better Auth config
5. Set up object storage URLs (Cloudflare R2 or AWS S3)

---

## 📝 Testing

### Playwright E2E Tests
**Location:** `/tests/` directory

**Test Coverage:**
- Authentication flow (login, register, logout)
- Image upload (including HEIC format)
- Catalog CRUD operations
- API response validation

### Run Tests
```bash
# Run all tests
npm test

# Run in UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode (step through)
npm run test:debug

# Show HTML report
npm run test:report
```

### Manual Testing Checklist
- [ ] Upload image (JPG, PNG, HEIC)
- [ ] Crop and process image
- [ ] Use all 6 editor tools
- [ ] Create paper doll (all 6 templates)
- [ ] Generate PDF (Letter and A4)
- [ ] Register new account
- [ ] Login with existing account
- [ ] Save designs to portfolio
- [ ] Create catalog and add items
- [ ] Create circle and share items
- [ ] Add reactions and compliments

---

## 📚 Key Documentation Files

1. **CLAUDE.md** - Main project instructions for AI assistance (comprehensive guide)
2. **HANDOFF.md** - This file (current status and handoff notes)
3. **docs/SETUP.md** - Setup guide, commands, troubleshooting
4. **docs/API.md** - API endpoints with request/response formats
5. **docs/BETTER_AUTH.md** - Better Auth implementation guide
6. **DOCKER_DEPLOYMENT.md** - Docker deployment documentation
7. **README.md** - Project overview and quick start

---

## 🎯 Next Session Checklist

When resuming work on this project:

1. **Start services and verify status:**
   ```bash
   cd /root/projects/wrigs-fashion
   docker compose up -d
   docker ps  # Should show both wrigs-fashion and wrigs-fashion-db-dev
   ```

2. **Verify application is working:**
   - Open https://localhost:443 (accept self-signed certificate warning)
   - Test image upload flow
   - Test catalog creation (verify no "Failed query" errors)
   - Check logs: `docker logs wrigs-fashion --tail 50`

3. **Review recent changes:**
   ```bash
   git log --oneline -10  # See recent commits
   git show 9c36b12       # Review database fix commit
   ```

4. **Check for updates:**
   - Review any new GitHub issues
   - Check for dependency updates
   - Read this HANDOFF.md document

5. **Begin Phase 6 work:**
   - Production deployment planning
   - Set up managed MySQL database
   - Configure object storage (Cloudflare R2)
   - Polish UI/UX (error handling, loading states)

---

## 🔐 Security Considerations

### Authentication
- Better Auth with email/password (30-day session expiry)
- Server-side session validation via `hooks.server.ts`
- No email verification in V1 (optional for V2)
- Password hashing handled by Better Auth

### Protected Routes
Require authentication:
- `/portfolio`
- `/circles`
- `/onboarding`

Public routes (work anonymously):
- `/upload`
- `/editor`
- `/doll-builder`
- `/catalogs` (anonymous users can create catalogs using sessionId)

### Child Safety Features
- Invite-only circles (no public discovery)
- Owner controls (can remove members/items)
- No free-text comments (preset reactions + compliments only)
- Minimal personal data collection (nickname + avatar, not full names)
- No direct messaging between users
- No public profiles

### Production Security TODOs
- [ ] Enable HTTPS with valid SSL certificate (Let's Encrypt)
- [ ] Set `useSecureCookies: true` in Better Auth config
- [ ] Add rate limiting to auth endpoints (prevent brute force)
- [ ] Set up error tracking (Sentry) without logging sensitive data
- [ ] Add CSRF protection
- [ ] Implement proper CORS configuration
- [ ] Set up security headers (helmet.js)
- [ ] Regular dependency updates (Dependabot)

---

## 💡 Design Decisions & Trade-offs

### Why MySQL 8.0+ Required?
- Drizzle ORM generates optimized SQL for modern MySQL features
- Better performance with JSON column support
- Full support for complex queries (window functions, CTEs)
- MariaDB 10.5 lacks several features causing compatibility issues

### Why Better Auth over NextAuth/Supabase?
- Lightweight and TypeScript-first
- Works seamlessly with SvelteKit
- Flexible session management
- No external dependencies (self-hosted)
- Active development and good documentation

### Why Hardcoded Templates (not in DB)?
- Simplifies V1 architecture
- Templates are static configuration (unlikely to change frequently)
- Easier to version control (TypeScript file)
- Can migrate to database in V2 if templates become dynamic

### Why 32-Color Posterization?
- Makes Magic Wand flood fill tool effective
- Consolidates similar colors into distinct regions
- Easier for kids to select and color specific areas
- Reduces file size slightly

### Why 2-Page PDF Layout?
- Separates doll base (page 1) from outfit piece (page 2)
- Makes printing and assembly instructions clearer
- Allows for different paper sizes (Letter vs A4)
- Professional appearance with cut lines and tabs

---

## 🎨 Design System

### Theme & Colors
- **DaisyUI Theme:** "Lemon Meringue"
- **Color Palette:** Pastel colors appropriate for young audience
- **Primary Color:** Soft yellow/cream
- **Secondary Color:** Lavender/purple
- **Accent Color:** Pink

### Typography
- **Font Stack:** Default DaisyUI system fonts
- **Headings:** Bold, friendly, age-appropriate
- **Body Text:** Clear, readable (14px base)

### Component Style
- **Framework:** Functional Svelte 5 components with runes
- **State Management:** Svelte 5 `$state`, `$derived`, `$effect`
- **Event Handlers:** Use `onchange={handler}`, NOT `on:change={handler}` (Svelte 5 syntax)
- **No class components:** Prefer functional style

### Accessibility
- Keyboard navigation support
- ARIA labels on interactive elements
- High contrast mode compatibility
- Screen reader friendly
- Touch-friendly buttons (min 44×44px)

### Design Note
ColorCustomizer component in `+layout.svelte` should be removed before production (it's a design tool for theme testing, not a user feature).

---

## 📊 Project Metrics

### Code Statistics
- **Total Lines of Code:** ~15,000+ (TypeScript + Svelte + CSS)
- **Components:** 50+ Svelte components
- **API Endpoints:** 25+ endpoints
- **Database Tables:** 14 tables
- **Paper Doll Templates:** 6 SVG files
- **Editor Tools:** 6 creative tools

### Performance Targets
- **Image upload:** <2 seconds for 5MB image
- **Image cleanup:** <5 seconds for typical sketch photo
- **PDF generation:** <10 seconds including storage upload
- **Portfolio page load:** <2 seconds
- **Catalog canvas rendering:** <1 second

### File Storage
- **Static files:** `/static/` directory
- **Uploaded images:** `/static/uploads/`
- **Generated PDFs:** `/static/pdfs/`
- **Doll templates:** `/static/templates/dolls/`

---

## 🔄 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev  # Opens on http://localhost:5173

# Start database
docker compose up -d wrigs-fashion-db-dev

# Run migrations
npm run db:generate
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Docker Development
```bash
# Build and start containers
docker compose up --build -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d
```

### Git Workflow
```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Create commit
git add <files>
git commit -m "fix: description of fix

Detailed explanation...

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

---

## 📞 Support & Resources

### Documentation
- **Better Auth Docs:** https://better-auth.com/docs
- **Drizzle ORM Docs:** https://orm.drizzle.team/docs
- **SvelteKit Docs:** https://kit.svelte.dev/docs
- **DaisyUI Docs:** https://daisyui.com/components
- **Playwright Docs:** https://playwright.dev/docs

### Project Resources
- **GitHub Repository:** https://github.com/ngriffin1978/wrigs-fashion
- **GitHub Issues:** https://github.com/ngriffin1978/wrigs-fashion/issues
- **Project Directory:** `/root/projects/wrigs-fashion`

### Key Commands Reference
```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run Playwright tests

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:push          # Push schema to DB
npm run db:studio        # Open Drizzle Studio

# Docker
docker compose up -d     # Start services
docker compose down      # Stop services
docker compose logs -f   # View logs
docker compose build     # Rebuild images

# Logs
docker logs wrigs-fashion --follow
docker exec wrigs-fashion tail -f /var/log/supervisor/sveltekit_error.log
```

---

## ✨ What Makes This Project Special

1. **Kid-Friendly Focus:** Designed specifically for young girls interested in fashion design
2. **Inclusive Templates:** 3 body types (Classic, Curvy, Petite) with positive labels
3. **Safety First:** Invite-only circles, no free-text comments, minimal personal data
4. **Real Printable Output:** Professional PDFs with cut lines and fold tabs
5. **Complete Creative Flow:** Upload sketch → edit → place on doll → print
6. **Modern Tech Stack:** Svelte 5, Better Auth, Drizzle ORM, Docker
7. **Mobile-Friendly:** Touch controls for tablets (primary target device)
8. **HEIC Support:** Works with iPhone/iPad photos out of the box

---

## 🎯 Vision for V2 (Future)

### Potential Features
- **AI Background Removal:** More advanced processing with machine learning
- **Custom Templates:** Let users create their own doll templates
- **Animation:** Animated paper dolls (digital wardrobe)
- **Real-Time Collaboration:** Multiple users editing same design
- **Mobile App:** Native iOS/Android apps
- **Parent Dashboard:** Parent controls and moderation tools
- **Age Gating:** COPPA-compliant age verification
- **OAuth Providers:** Sign in with Google, Apple
- **Marketplace:** Share and download designs from community (moderated)
- **Print Service Integration:** Order professional prints directly

---

**End of Handoff Document**

**Status:** Ready for Phase 6 - Polish & Production Deployment
**Critical Issues:** None - All systems operational
**Last Major Fix:** Database compatibility (2026-02-11)
**Next Milestone:** Production deployment with managed infrastructure

_This document should be updated before each extended break from the project to ensure smooth continuity when resuming work._
