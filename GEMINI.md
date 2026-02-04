# GEMINI.md

Instructions for Google Gemini AI when working on the Wrigs Fashion project.

---

## Project Overview

**Wrigs Fashion** is a web application for kids (ages 7-13) to:
1. Upload photos of their hand-drawn fashion sketches
2. Digitize and clean up the drawings (remove background, enhance colors)
3. Color designs with creative tools (brush, patterns, effects)
4. Place designs on paper doll templates
5. Generate printable PDFs (2-page: doll + outfit)
6. Save to portfolio and share with invite-only friend circles (future)

**Current Status:** Phase 2 Complete (Paper Doll System working end-to-end)
**Next Phase:** Phase 3 (Authentication + Database Integration)

---

## How to Help

### When Asked to Code
1. Read `/home/grifin/projects/wrigs-fashion/CLAUDE.md` for full specification
2. Read `/home/grifin/projects/wrigs-fashion/HANDOFF.md` for current session context
3. Follow Svelte 5 syntax (use `$state`, `$effect`, not old `$:` or `on:` syntax)
4. Write TypeScript with strict types
5. Follow existing code patterns (see SESSION-SUMMARY.md → Code Patterns section)
6. Test manually after implementing (no automated tests yet)

### When Asked to Review
- Check kid-friendliness (ages 7-13)
- Verify inclusive language (especially for body types)
- Ensure touch-friendly UI (44px minimum tap targets)
- Validate color contrast (soft pastels but readable)
- Check accessibility (screen reader friendly)

### When Asked to Debug
- Check SESSION-SUMMARY.md → Troubleshooting Guide first
- Look for common issues (permissions, ports, file paths)
- Verify Node version (v18.20.8 required)
- Check dev server status (should be on port 3001)

---

## Critical Context

### Tech Stack
- **Framework:** SvelteKit with Svelte 5 (runes-based reactivity)
- **Styling:** TailwindCSS + DaisyUI (Lemon Meringue theme)
- **Language:** TypeScript (strict mode)
- **Server:** Node.js v18.20.8
- **Image Processing:** Sharp.js (server-side)
- **PDF Generation:** PDFKit (server-side)
- **Database:** Drizzle ORM + MySQL (not yet connected)
- **Auth:** Lucia Auth (planned, not yet implemented)

### Color Scheme: Lemon Meringue
```javascript
{
  primary: '#FFF8B8',    // Soft buttery yellow
  secondary: '#FFE9C5',  // Warm cream
  accent: '#FFD4E5',     // Light blush pink
  success: '#D0F0C0'     // Fresh mint green
}
```

### File Structure
```
wrigs-fashion/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Homepage
│   │   ├── upload/+page.svelte       # Upload + crop (569 lines)
│   │   ├── editor/+page.svelte       # Canvas editor (548 lines)
│   │   ├── doll-builder/+page.svelte # Template selection (262 lines)
│   │   ├── doll-builder/place/       # Design placement (384 lines)
│   │   └── api/
│   │       ├── upload/+server.ts     # Image processing (113 lines)
│   │       └── generate-pdf/+server.ts # PDF generation (65 lines)
│   └── lib/
│       ├── data/doll-templates.ts    # Template metadata (184 lines)
│       └── services/pdf-generator.ts # PDF service (333 lines)
├── static/
│   ├── uploads/                      # Processed images
│   ├── pdfs/                         # Generated PDFs
│   └── templates/dolls/              # 6 SVG doll templates
└── [documentation files]
```

---

## Current Implementation Status

### ✅ What's Working (Phase 1 + 2 Complete)
- Image upload with drag-and-drop validation
- Freeform crop tool (path-based selection)
- Sharp.js processing pipeline:
  - Resize to max 2000px
  - Brightness/saturation boost
  - Background removal
  - Color normalization (32 colors)
  - Edge sharpening
- Canvas editor with 6 tools:
  - 🖌️ Brush (with patterns: dots, stripes, stars, hearts, sparkles)
  - 💨 Spray Paint (random dots)
  - ✨ Glitter (sparkly effect)
  - 🎨 Stamp (hearts, stars)
  - 🪄 Magic Wand (color removal)
  - 🧹 Eraser (transparency)
- 6 inclusive paper doll templates (2 poses × 3 body types):
  - Pose A (arms out) + Pose B (arms down)
  - Classic Build, Curvy Build, Petite Build
- Template selection UI with filters
- Interactive design placement (drag/scale on canvas)
- PDF generation (Letter + A4):
  - Page 1: Doll base with cut lines
  - Page 2: Outfit piece with tabs
- End-to-end tested from upload to printable PDF

### ❌ What's Missing (Phase 3+ To-Do)
- Authentication (no user system yet)
- Database connection (schema exists but not migrated)
- Portfolio CRUD (can't save/view/delete designs)
- Sharing features (invite-only circles, reactions, compliments)
- Automated testing (Playwright E2E)
- Deployment infrastructure

---

## Design Principles (IMPORTANT)

### 1. Kid-First Design
- Simple, clear language (7-13 year old reading level)
- Large buttons (44px minimum)
- Playful but not "baby-ish"
- Encouraging tone (no negativity)

### 2. Inclusive Representation
- 3 body types with positive labels:
  - "Classic Build" (not "average" or "normal")
  - "Curvy Build" (not "plus size")
  - "Petite Build" (not "small" or "skinny")
- All body types presented equally (no hierarchy)
- Celebrate diversity in all features

### 3. Safe by Default
- Invite-only sharing (no public feed)
- Minimal data collection (COPPA compliance)
- Private portfolios by default
- Parent-friendly privacy controls (future)

### 4. Creative Empowerment
- Tools amplify hand-drawn art (don't replace it)
- Printable outputs (tangible, not just digital)
- Save and revisit work (after Phase 3)
- Share with friends safely (after Phase 4)

---

## Code Conventions

### Svelte 5 Syntax (NEW - Use This!)
```svelte
<script lang="ts">
  // State (reactive variables)
  let count = $state(0);

  // Derived values (computed)
  let doubled = $derived(count * 2);

  // Effects (side effects)
  $effect(() => {
    console.log('Count changed:', count);
  });

  // Event handlers (NO "on:" prefix!)
  function handleClick() {
    count++;
  }
</script>

<button onclick={handleClick}>
  Count: {count}
</button>
```

### TypeScript Conventions
```typescript
// Strict types
interface Design {
  id: string;
  userId: string;
  title: string;
  originalImageUrl: string;
  cleanedImageUrl: string;
}

// Function signatures
async function processImage(
  fileId: string,
  buffer: Buffer
): Promise<{ success: boolean; cleanedUrl: string }> {
  // Implementation
}
```

### File Naming
- Components: `PascalCase.svelte`
- Utilities: `camelCase.ts`
- API routes: `kebab-case/+server.ts`

---

## Common Tasks and Patterns

### Adding a New Page
```bash
# Create page file
touch src/routes/my-page/+page.svelte

# Add navigation link in +layout.svelte
# <a href="/my-page">My Page</a>
```

### Creating an API Endpoint
```typescript
// src/routes/api/my-endpoint/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();

  // Process data

  return json({ success: true });
};
```

### Image Processing Pattern
```typescript
import sharp from 'sharp';

const processed = await sharp(buffer)
  .resize(2000, 2000, { fit: 'inside' })
  .modulate({ brightness: 1.4, saturation: 1.5 })
  .normalise()
  .sharpen()
  .png({ palette: true, colours: 32 })
  .toBuffer();
```

### PDF Generation Pattern
```typescript
import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 36, bottom: 36, left: 36, right: 36 }
});

doc.pipe(fs.createWriteStream(outputPath));
doc.fontSize(18).text('My Paper Doll', { align: 'center' });
doc.image(imagePath, x, y, { width, height });
doc.end();
```

---

## Testing Checklist

### Before Committing Code
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] Type checking passes (`npm run check`)
- [ ] Manual testing of changed feature completed
- [ ] No console errors in browser
- [ ] Responsive design verified (desktop + tablet viewport)
- [ ] Code follows existing patterns

### End-to-End Flow Test
1. Go to http://localhost:3001/upload
2. Upload a fashion sketch photo
3. Draw freeform selection around drawing
4. Click "Crop & Continue"
5. Click "Process Drawing" (wait ~3 seconds)
6. Click "Start Coloring"
7. Use editor tools to add color/patterns
8. Click "Create Paper Doll"
9. Select a template (try filtering)
10. Place design on canvas (drag, scale)
11. Click "Generate PDF"
12. Download and verify PDF opens correctly

---

## Troubleshooting Common Issues

### Permission Denied (.svelte-kit)
```bash
sudo rm -rf .svelte-kit
npm run dev
```

### Port 3000 Already in Use
App runs on port 3001 by default. Check `vite.config.js`.

### Sharp Module Not Found
```bash
npm install sharp --force
```

### Type Errors with Svelte 5
Use `$state`, `$effect`, `$derived` (not old `$:` or `let x = $state(0)` pattern).

### Image URLs Not Loading
Static files in `/static/` are served at root:
- `/static/uploads/abc.png` → `/uploads/abc.png`
- `/static/templates/dolls/pose-a.svg` → `/templates/dolls/pose-a.svg`

---

## Phase 3 Priorities (Next Session)

### 1. Authentication (Lucia Auth)
**Goal:** Users can register, log in, and maintain sessions.

**Tasks:**
- [ ] Install and configure Lucia Auth
- [ ] Create user registration page (`/register`)
- [ ] Create login page (`/login`)
- [ ] Set up session management (cookies)
- [ ] Add protected route middleware
- [ ] Create logout functionality

**Files to Create:**
- `/src/lib/server/auth.ts` - Lucia Auth setup
- `/src/routes/register/+page.svelte` - Registration form
- `/src/routes/login/+page.svelte` - Login form
- `/src/routes/api/auth/register/+server.ts` - Registration endpoint
- `/src/routes/api/auth/login/+server.ts` - Login endpoint
- `/src/routes/api/auth/logout/+server.ts` - Logout endpoint

### 2. Database Integration
**Goal:** Connect to MySQL and save designs/projects.

**Tasks:**
- [ ] Connect to MySQL database (local or hosted)
- [ ] Run Drizzle migrations (`npm run db:migrate`)
- [ ] Update upload API to save Design records
- [ ] Update PDF generation to save DollProject records
- [ ] Test CRUD operations in Drizzle Studio

**Commands:**
```bash
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations
npm run db:studio    # Open database GUI
```

---

## Important Reminders

### Safety & Privacy
- Target users are children (ages 7-13)
- COPPA compliance required (minimize data collection)
- No public social features (invite-only only)
- Default to private portfolios

### Performance Targets
- Image processing: <5 seconds
- PDF generation: <10 seconds
- Canvas drawing: Smooth at 60fps
- Page load: <2 seconds

### Browser Support
- Primary: Chrome (desktop + mobile)
- Test on Firefox and Safari before launch
- Tablet-optimized (768px+ viewports)

### Accessibility
- Keyboard navigation supported
- Screen reader friendly (ARIA labels)
- High color contrast (soft pastels but readable)
- Touch targets 44px minimum

---

## Quick Reference Links

**Documentation:**
- Full spec: `/home/grifin/projects/wrigs-fashion/CLAUDE.md`
- Project history: `/home/grifin/projects/wrigs-fashion/SESSION-SUMMARY.md`
- Current handoff: `/home/grifin/projects/wrigs-fashion/HANDOFF.md`
- Agent config: `/home/grifin/projects/wrigs-fashion/AGENTS.md`

**Key URLs:**
- Dev server: http://localhost:3001
- Upload flow: http://localhost:3001/upload
- Editor: http://localhost:3001/editor (with query params)
- Template selection: http://localhost:3001/doll-builder (with query params)

**Commands:**
```bash
nvm use 18           # Switch to Node v18
npm run dev          # Start dev server (port 3001)
npm run check        # Type check
npm run build        # Production build
npm run db:studio    # Database GUI (after Phase 3)
```

---

## Final Notes

This project prioritizes:
1. **User value first** - Built creative tools before auth/database
2. **Inclusive design** - 3 body types, positive language
3. **Safety** - Invite-only sharing, minimal data collection
4. **Tangible output** - Printable paper dolls (not just digital)

Always ask if unsure about:
- Language choice (inclusive terminology)
- Privacy implications (data collection)
- Kid-friendliness (is this appropriate for ages 7-13?)
- Design decisions (does this match the color scheme?)

---

**Last Updated:** 2026-02-03 (End of Session 3)
**Status:** Phase 2 Complete, Phase 3 Next (Authentication + Database)
**Ready for next session!**
