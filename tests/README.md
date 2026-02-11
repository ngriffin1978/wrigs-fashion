# Wrigs Fashion - Playwright Test Suite

## Overview
Comprehensive end-to-end tests for Wrigs Fashion application covering all major user flows.

## Setup

### Install Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration
Tests are configured to:
- Ignore HTTPS certificate errors (self-signed cert)
- Run on base URL: `https://srv1315945.hstgr.cloud`
- Use headed mode for debugging
- Capture screenshots on failure
- Record videos of test runs

### Run Tests
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/01-homepage.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

## Test Structure

### 01-homepage.spec.ts
- Homepage loads correctly
- Navigation menu present
- Hero section displays
- Call-to-action buttons work

### 02-upload-and-process.spec.ts
- Image upload (drag-and-drop)
- Freeform crop tool
- Image processing pipeline
- Cleaned image generation

### 03-canvas-editor.spec.ts
- 6 drawing tools (Brush, Spray, Glitter, Stamp, Magic Wand, Eraser)
- Color picker
- Pattern overlays
- Canvas save functionality

### 04-paper-doll-system.spec.ts
- Template selection (6 templates)
- Filter by pose/body type
- Design placement canvas
- PDF generation (Letter & A4)

### 05-authentication.spec.ts
- User registration
- Email/password validation
- Login/logout
- Session persistence
- Protected routes

### 06-portfolio.spec.ts
- Portfolio listing
- Design CRUD operations
- Achievement badges
- Stats display

### 07-circles.spec.ts
- Circle creation
- Invite code generation
- Join via code
- Member management
- Leave/delete circle

### 08-sharing.spec.ts
- Share design to circle
- Batch share to multiple circles
- Shared items feed
- Remove shared item

### 09-reactions.spec.ts
- Add emoji reaction
- Toggle reaction (remove)
- Add preset compliment
- Display reaction counts

### 10-catalog-system.spec.ts
- Create catalog
- Add items to canvas
- Drag/resize/rotate items
- Generate share link
- Public catalog view

## Test Data

### Test Images
- `test-image.jpg` - Standard JPG (2MB)
- `test-image.png` - PNG with transparency (1MB)
- `test-sketch.jpg` - Fashion sketch drawing (3MB)

### Test Users
Tests will create temporary users with random emails:
- Pattern: `test-${Date.now()}@example.com`
- Password: `TestPassword123!`
- Nickname: `TestUser${random}`

### Test Circles
- Circle names: `Test Circle ${timestamp}`
- Invite codes: Auto-generated 8-char codes

## Known Issues to Test For

Based on project history, watch for:
1. **HEIC/HEIF Upload Issues** - iOS photo format support
2. **Image Processing Timeout** - Should complete in <5 seconds
3. **Session Cookie Persistence** - Auth should survive page refresh
4. **Catalog Migration** - Anonymous catalogs should migrate on signup
5. **PDF Generation** - Both Letter and A4 sizes
6. **Invite Code Collision** - Rare but possible with 8-char codes
7. **Orphaned Shares** - Cleanup when design deleted
8. **Canvas Performance** - Editor should be responsive with large images

## Debugging Failed Tests

### View Test Report
```bash
npx playwright show-report
```

### Run Single Test in Debug Mode
```bash
npx playwright test tests/05-authentication.spec.ts --debug
```

### View Trace
```bash
npx playwright show-trace test-results/trace.zip
```

### Check Screenshots
Failed test screenshots saved to: `test-results/`

## CI/CD Integration

Tests can be run in GitHub Actions:
```yaml
- name: Run Playwright tests
  run: npx playwright test
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```
