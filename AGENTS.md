# AGENTS.md

Configuration file for AI agents and specialized assistants working on the Wrigs Fashion project.

---

## Project Context

**Project Name:** Wrigs Fashion V1
**Type:** Kid-friendly fashion design web application
**Target Users:** Children ages 7-13 who enjoy drawing fashion designs
**Core Mission:** Digitize hand-drawn fashion sketches → color them digitally → create printable paper dolls

---

## Agent Roles and Responsibilities

### 1. Code Development Agent (Primary)
**Role:** Full-stack development, feature implementation, bug fixes
**Context Required:**
- Read CLAUDE.md for complete project specification
- Read SESSION-SUMMARY.md for project history and decisions
- Read HANDOFF.md for current session context and next steps
- Follow coding conventions in CLAUDE.md section 12

**Key Tasks:**
- Implement features according to roadmap (see SESSION-SUMMARY.md)
- Write clean, type-safe TypeScript code
- Use Svelte 5 runes ($state, $effect, $derived)
- Maintain consistency with existing code patterns
- Test implementations manually (automated testing TBD)

**Current Phase:** Phase 3 (Authentication + Database Integration)

---

### 2. Documentation Agent (Session Closure)
**Role:** Maintain project documentation, session handoffs, knowledge base
**Context Required:**
- Read entire conversation thread
- Synthesize decisions, changes, and context
- Update all documentation files consistently

**Key Tasks:**
- Update SESSION-SUMMARY.md with new session details
- Update HANDOFF.md with immediate next steps
- Ensure README.md reflects current project state
- Synchronize CLAUDE.md, AGENTS.md, GEMINI.md
- Maintain consistency across all documentation

**Trigger:** End of work session, before handoff to next developer

---

### 3. Design Review Agent
**Role:** UX/UI review, accessibility audit, design consistency
**Context Required:**
- Read CLAUDE.md sections 2 (Target User), 12 (Code Style), 14 (Development Workflow)
- Understand kid-first design principles
- Know color scheme (Lemon Meringue theme)

**Key Tasks:**
- Review UI components for kid-friendliness
- Ensure 44px minimum touch targets
- Verify color contrast and readability
- Check responsive design (tablet-first)
- Validate inclusive language (especially for body types)

**Current Design System:**
- DaisyUI components with Lemon Meringue theme
- Soft pastel colors (warm tones)
- Emoji icons for tools
- Large, clear buttons
- Touch-optimized controls

---

### 4. Testing Agent
**Role:** Quality assurance, bug identification, test automation
**Context Required:**
- Read SESSION-SUMMARY.md for test coverage gaps
- Understand critical user flows (upload → edit → PDF)
- Know edge cases that need coverage

**Key Tasks:**
- Perform end-to-end testing of user flows
- Test cross-browser compatibility (Chrome, Firefox, Safari)
- Test on actual mobile/tablet devices
- Identify regression risks
- Write Playwright E2E tests (when implemented)

**Priority Test Scenarios:**
1. Complete flow: Upload → Crop → Process → Edit → Paper Doll → PDF
2. All 6 templates with all 4 categories
3. Image upload validation (file types, sizes)
4. PDF generation for both Letter and A4
5. Canvas editor tools (all 6 tools)

---

### 5. Security Agent
**Role:** Security review, data privacy, COPPA compliance
**Context Required:**
- Target users are children (ages 7-13)
- COPPA compliance required (minimize data collection)
- Invite-only sharing model
- No public social features

**Key Tasks:**
- Review authentication implementation (Phase 3)
- Ensure minimal personal data collection
- Validate privacy controls for sharing features
- Review session management security
- Check for common vulnerabilities (XSS, CSRF, SQL injection)

**Security Checklist (for Phase 3+):**
- [ ] Password hashing with bcrypt/argon2
- [ ] Session tokens stored securely
- [ ] HTTPS only in production
- [ ] Input validation on all forms
- [ ] File upload validation (type, size, content)
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection on state-changing operations

---

## Specialized Agents

### Image Processing Agent
**Domain:** Sharp.js pipeline, color normalization, background removal
**Expertise:** Image manipulation, performance optimization
**Files:** `/src/routes/api/upload/+server.ts`

**Known Challenges:**
- Balance between processing quality and speed
- Different paper backgrounds (white, cream, colored)
- Various drawing mediums (pencil, crayon, marker, colored pencil)

**Current Pipeline:**
1. Resize to max 2000px
2. Brightness boost (1.4x)
3. Saturation boost (1.5x)
4. Normalize (push background to white)
5. Sharpen edges
6. Posterize to 32 colors
7. Add padding

---

### PDF Generation Agent
**Domain:** PDFKit, printable layout, paper doll assembly
**Expertise:** Print design, PDF optimization, accessibility
**Files:** `/src/lib/services/pdf-generator.ts`, `/src/routes/api/generate-pdf/+server.ts`

**Design Constraints:**
- Safe margins: 0.5 inch / 12.7mm
- Support both US Letter and A4
- Cut lines must be visible but not overwhelming
- Fold tabs clearly labeled
- Instructions on each page

**Current Structure:**
- Page 1: Doll base + cut lines + stand tab
- Page 2: Outfit piece + user design + fold tabs

---

### Database Agent
**Domain:** Drizzle ORM, MySQL, data modeling
**Expertise:** Schema design, migrations, queries
**Files:** `/src/lib/server/db/schema.ts`

**Schema Overview:**
- User (id, email, nickname, avatarUrl)
- Design (id, userId, title, originalImageUrl, cleanedImageUrl, coloredOverlayUrl)
- DollTemplate (id, name, pose, baseImageUrl, regions JSON)
- DollProject (id, userId, designId, dollTemplateId, pieces JSON, pdfUrl)
- Circle (id, ownerId, name, inviteCode)
- CircleMember (id, circleId, userId, role)
- SharedItem (id, circleId, itemType, itemId)
- Reaction (id, userId, sharedItemId, reactionType)
- Compliment (id, userId, sharedItemId, complimentType)

**Status:** Schema defined, not yet connected (Phase 3 task)

---

## Agent Communication Protocol

### When Starting Work
1. Read HANDOFF.md first (immediate context)
2. Read SESSION-SUMMARY.md for project history
3. Read CLAUDE.md for specifications and conventions
4. Check current phase and priorities
5. Verify dev server is running (`npm run dev` on port 3001)

### When Completing Work
1. Document all changes made (file paths, line counts)
2. Note any decisions or trade-offs
3. Update HANDOFF.md with next steps
4. Run manual tests to verify functionality
5. Commit with clear, descriptive messages

### When Encountering Issues
1. Check SESSION-SUMMARY.md → Troubleshooting Guide
2. Review related code patterns in SESSION-SUMMARY.md
3. Check existing implementations for similar patterns
4. Document new solutions in session notes

---

## Project State Information

### Current Status (as of 2026-02-03)
- **Phase 1:** COMPLETE (Upload + Editor)
- **Phase 2:** COMPLETE (Paper Doll System + PDF Generation)
- **Phase 3:** NEXT (Authentication + Database Integration)
- **Phase 4:** FUTURE (Portfolio CRUD)
- **Phase 5:** FUTURE (Sharing + Circles)

### What Works Right Now
- Image upload with drag-and-drop
- Freeform crop tool
- Sharp.js processing pipeline
- Canvas editor with 6 tools (Brush, Spray, Glitter, Stamp, Magic Wand, Eraser)
- 6 pattern overlays
- 6 inclusive paper doll templates (2 poses × 3 body types)
- Template selection with filters
- Interactive design placement
- PDF generation (Letter and A4)
- End-to-end tested from upload to printable PDF

### What's Missing (Critical Path)
- Authentication (Lucia Auth planned)
- Database connection and migrations
- Portfolio CRUD operations
- Invite-only Circles
- Sharing with reactions/compliments

---

## Technology Stack

### Frontend
- **Framework:** SvelteKit with Svelte 5 (runes)
- **Styling:** TailwindCSS + DaisyUI (Lemon Meringue theme)
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite

### Backend
- **Framework:** SvelteKit (server routes)
- **Image Processing:** Sharp.js
- **PDF Generation:** PDFKit
- **Auth:** Lucia Auth (planned, not yet implemented)

### Database
- **ORM:** Drizzle
- **Database:** MySQL 8.0+
- **Connection:** Not yet established

### Utilities
- **File IDs:** Nanoid (10-character, URL-safe)
- **Dev Server:** Vite on port 3001

---

## Code Conventions (Summary)

### File Structure
- `/src/routes/` - Pages and API routes
- `/src/lib/components/` - Reusable components
- `/src/lib/services/` - Business logic (PDF, image processing)
- `/src/lib/data/` - Static data (templates)
- `/src/lib/server/` - Server-only code (DB, auth)

### Naming
- Components: PascalCase (`DesignEditor.svelte`)
- Utilities: camelCase (`imageProcessor.ts`)
- API routes: kebab-case (`generate-pdf/+server.ts`)

### Svelte 5 Patterns
```typescript
// State
let count = $state(0);

// Derived values
let doubled = $derived(count * 2);

// Effects
$effect(() => {
  console.log('Count changed:', count);
});

// Event handlers (no `on:` prefix)
<button onclick={() => count++}>Click</button>
```

### TypeScript
- Strict mode enabled
- No implicit any
- Proper type definitions for all functions
- Use interfaces for data shapes

---

## Important Notes for All Agents

### Design Principles
1. **Kid-first:** Simple, clear, encouraging
2. **Safe by default:** Private portfolios, invite-only sharing
3. **Inclusive:** Celebrate diversity (body types, abilities)
4. **Tangible:** Printable outputs (not just digital)
5. **Creative:** Amplify hand-drawn art (don't replace it)

### Language Guidelines
- Use positive, inclusive terms
- Avoid body-shaming language
- Keep instructions simple (7-13 year old reading level)
- Be encouraging and playful

### Performance Targets
- Image processing: <5 seconds
- PDF generation: <10 seconds
- Canvas drawing: 60fps smooth
- Page load: <2 seconds

### Browser Support
- Primary: Chrome (desktop and mobile)
- Secondary: Firefox, Safari (test before launch)
- Tablet-optimized (768px+ viewports)

---

## Quick Reference

**Dev Server:** http://localhost:3001
**Node Version:** v18.20.8 (use `nvm use 18`)
**Start Command:** `npm run dev`
**Database Status:** Not connected (Phase 3 task)
**Auth Status:** Not implemented (Phase 3 task)

**Key Files:**
- Project spec: `/home/grifin/projects/wrigs-fashion/CLAUDE.md`
- Session history: `/home/grifin/projects/wrigs-fashion/SESSION-SUMMARY.md`
- Current handoff: `/home/grifin/projects/wrigs-fashion/HANDOFF.md`
- Agent config: `/home/grifin/projects/wrigs-fashion/AGENTS.md` (this file)
- Gemini config: `/home/grifin/projects/wrigs-fashion/GEMINI.md`

---

**Last Updated:** 2026-02-03 (End of Session 3)
**Next Session Priority:** Implement Lucia Auth (Phase 3)
