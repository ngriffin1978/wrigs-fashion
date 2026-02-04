# Wrigs Fashion V1

A delightful web app for kids (ages 7-13) to digitize their fashion sketches and create printable paper dolls.

## Current Status

**Phase 2 Complete:** Paper doll template system and PDF generation fully functional.

Working features:
- Image upload with drag-and-drop
- Freeform crop/selection tool
- Image processing with color normalization
- Canvas-based editor with 6 creative tools
- Pattern overlays and effects
- Save designs as PNG
- **6 inclusive paper doll templates** (2 poses × 3 body types)
- **Interactive design placement** with live preview
- **PDF generation** (Letter & A4) with cut lines and tabs

Next phase: Authentication and database integration for portfolio management.

## Quick Start

```bash
# Prerequisites: Node.js 18+
npm install

# Start development server
npm run dev

# App runs on http://localhost:3001
```

## Key Features

- **📷 Upload & Crop:** Drag-and-drop file upload with freeform selection tool (draw around your drawing)
- **🎨 Image Processing:** Sharp.js-powered cleanup with background removal, color boost, and 32-color normalization
- **✏️ Creative Editor:** 6 tools (Brush, Spray Paint, Glitter, Stamp, Magic Wand, Eraser) with pattern support
- **🌈 Patterns:** Dots, stripes, stars, hearts, sparkles
- **👗 Paper Doll Templates:** 6 inclusive templates with 2 poses and 3 body types
- **🖨️ PDF Export:** Printable 2-page PDFs with doll base and outfit pieces (Letter & A4)
- **💾 Save & Export:** Download designs as PNG or generate printable paper dolls

## User Flow (V1)

1. **Upload:** Take a photo of hand-drawn fashion sketch
2. **Crop:** Freeform selection tool to isolate drawing
3. **Process:** Automatic background removal and color enhancement
4. **Edit:** Color with brush, patterns, and effects
5. **Save:** Export as PNG
6. **Create Paper Doll:** Choose template (pose + body type), place design, generate PDF
7. **Print & Play:** Print 2-page PDF, cut along lines, fold tabs, dress your doll

## Project Structure

```
wrigs-fashion/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Homepage
│   │   ├── +layout.svelte            # Navigation + footer
│   │   ├── upload/+page.svelte       # Upload + crop tool (569 lines)
│   │   ├── editor/+page.svelte       # Canvas editor (560 lines)
│   │   ├── doll-builder/+page.svelte # Template selection (262 lines)
│   │   ├── doll-builder/place/       # Design placement UI (384 lines)
│   │   ├── portfolio/+page.svelte    # Portfolio (placeholder)
│   │   └── api/
│   │       ├── upload/+server.ts     # Image processing (113 lines)
│   │       └── generate-pdf/+server.ts # PDF generation (65 lines)
│   └── lib/
│       ├── components/               # Reusable components
│       ├── data/
│       │   └── doll-templates.ts     # Template metadata (184 lines)
│       └── services/
│           └── pdf-generator.ts      # PDFKit service (333 lines)
├── static/
│   ├── uploads/                      # Processed images
│   ├── pdfs/                         # Generated PDFs
│   └── templates/dolls/              # 6 SVG doll templates
├── package.json
├── HANDOFF.md                        # Session handoff document
└── SESSION-SUMMARY.md                # Complete project history
```

## Tech Stack

- **Framework:** SvelteKit with Svelte 5 (runes)
- **Styling:** TailwindCSS + DaisyUI (Lemon Meringue theme)
- **Language:** TypeScript
- **Database:** Drizzle ORM + MySQL (schema exists, not yet integrated)
- **Image Processing:** Sharp.js (server-side)
- **PDF Generation:** PDFKit (server-side)
- **Build Tool:** Vite

## Color Scheme: Lemon Meringue 🍋

Soft pastel palette designed for kids:
- **Primary:** `#FFF8B8` - Soft buttery yellow
- **Secondary:** `#FFE9C5` - Warm cream
- **Accent:** `#FFD4E5` - Light blush pink
- **Success:** `#D0F0C0` - Fresh mint green

## Paper Doll Templates

**6 inclusive templates created:**
- **Pose A:** Classic paper doll pose with arms out (great for jackets/accessories)
- **Pose B:** Standing pose with arms down (great for dresses/flowing designs)
- **Body Types:** Classic Build, Curvy Build, Petite Build

All templates are SVG files with defined outfit regions (top, bottom, dress, shoes).

## Development

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run check
npm run check:watch

# Build for production
npm run build
npm run preview

# Database commands (Drizzle ORM)
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema directly (dev)
npm run db:studio    # Database GUI
```

## Known Issues

- Permission errors when `.svelte-kit` gets owned by root (fix: `sudo rm -rf .svelte-kit`)
- ColorCustomizer component still in layout (design tool, should be removed for production)
- No authentication yet (Phase 3 feature planned)
- Database schema exists but not yet used
- Portfolio CRUD not yet implemented

## Links

- [HANDOFF.md](HANDOFF.md) - Immediate session handoff notes
- [SESSION-SUMMARY.md](SESSION-SUMMARY.md) - Complete project history
- [CLAUDE.md](CLAUDE.md) - Full project specification and coding guidelines
- [PAPER_DOLL_IMPLEMENTATION.md](PAPER_DOLL_IMPLEMENTATION.md) - Paper doll system details

## Design Philosophy

Built for young creators (ages 7-13):
- Large touch-friendly buttons (44px min)
- Soft pastel colors (kid-friendly, not baby-ish)
- Simple, clear navigation
- Friendly, encouraging language
- Safe, invite-only sharing (coming in Phase 4)
- **Inclusive body representation** (3 body types, no body shaming)

## License

Private project - All rights reserved
