# Wrigs Fashion V1

A delightful web app for kids (ages 7-13) to digitize their fashion sketches and create printable paper dolls.

## Current Status

**Production Ready:** Core features complete with authentication, database, and catalog sharing.

Working features:
- Image upload with drag-and-drop
- Freeform crop/selection tool (touch-enabled for tablets)
- Image processing with color normalization
- Canvas-based editor with 6 creative tools
- Pattern overlays and effects
- Save designs as PNG
- **6 inclusive paper doll templates** (2 poses × 3 body types)
- **Interactive design placement** with live preview
- **PDF generation** (Letter & A4) with cut lines and tabs
- **User authentication** (register/login with nickname)
- **Catalog system** - create and manage design collections
- **Circle sharing** - share catalogs with friends via invite codes
- **Password reset** - no email required
- **Reactions & compliments** on shared items

## Quick Start

```bash
# Prerequisites: Node.js 18+
npm install

# Start development server
npm run dev

# App runs on http://localhost:3001
```

## Key Features

- **📷 Upload & Crop:** Drag-and-drop file upload with freeform selection tool
- **🎨 Image Processing:** Sharp.js-powered cleanup with background removal and color boost
- **✏️ Creative Editor:** 6 tools (Brush, Spray Paint, Glitter, Stamp, Magic Wand, Eraser)
- **🌈 Patterns:** Dots, stripes, stars, hearts, sparkles
- **👗 Paper Doll Templates:** 6 inclusive templates with 2 poses and 3 body types
- **🖨️ PDF Export:** Printable 2-page PDFs with doll base and outfit pieces
- **📚 Catalogs:** Create collections of your designs on a canvas
- **👥 Circles:** Share catalogs with friends using invite codes
- **💬 Reactions & Compliments:** React with emojis and send compliments to friends

## User Flow

1. **Upload:** Take a photo of hand-drawn fashion sketch
2. **Crop:** Freeform selection tool to isolate drawing
3. **Process:** Automatic background removal and color enhancement
4. **Edit:** Color with brush, patterns, and effects
5. **Save:** Export as PNG or add to a catalog
6. **Catalog:** Drag, resize, arrange designs on a canvas
7. **Share:** Share catalogs to your Circle of friends
8. **Create Paper Doll:** Choose template, place design, generate PDF
9. **Print & Play:** Print 2-page PDF, cut along lines, fold tabs

## Tech Stack

- **Framework:** SvelteKit with Svelte 5 (runes)
- **Styling:** TailwindCSS + DaisyUI (Lemon Meringue theme)
- **Language:** TypeScript
- **Database:** Drizzle ORM + MySQL 8.0
- **Authentication:** Better Auth
- **Image Processing:** Sharp.js
- **PDF Generation:** PDFKit

## Design Philosophy

Built for young creators (ages 7-13):
- Large touch-friendly buttons (44px min)
- Soft pastel colors (kid-friendly, not baby-ish)
- Simple, clear navigation
- Friendly, encouraging language
- Safe, invite-only sharing (Circles)
- **Inclusive body representation** (3 body types)

## Links

- [CLAUDE.md](CLAUDE.md) - Full project specification
- [HANDOFF.md](HANDOFF.md) - Session handoff notes
- [SESSION-SUMMARY.md](SESSION-SUMMARY.md) - Project history

## License

Private project - All rights reserved
