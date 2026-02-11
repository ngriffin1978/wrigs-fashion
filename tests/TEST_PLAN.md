# Wrigs Fashion - Comprehensive Test Plan

## 🎯 Test Suite Overview

Created a complete Playwright test suite covering all major features of Wrigs Fashion. The tests are designed to:
- Identify authentication issues
- Test image upload and processing pipeline
- Verify paper doll PDF generation
- Test Circle/Sharing system (Phase 5)
- Check reactions and compliments functionality
- Validate database operations

## 📦 What Was Created

### Test Files (7 test suites)
1. **`01-homepage.spec.ts`** (8 tests)
   - Homepage loads correctly
   - Navigation menu and hero section
   - Responsive design (tablet viewport)
   - No console errors
   - Call-to-action buttons work

2. **`02-upload-and-process.spec.ts`** (11 tests)
   - Image upload via drag-and-drop
   - File size validation (10MB limit)
   - File type validation (JPG, PNG, HEIC)
   - Freeform crop tool
   - Sharp.js processing pipeline (< 5 seconds)
   - Cleaned image with white background
   - Progress indicators

3. **`04-paper-doll-system.spec.ts`** (15 tests)
   - Template selection page
   - 6 paper doll templates display
   - Filter by pose (A/B)
   - Filter by body type (Classic/Curvy/Petite)
   - Design placement canvas
   - Outfit category selection
   - Paper size selection (Letter & A4)
   - PDF generation (< 10 seconds)
   - Live preview

4. **`05-authentication.spec.ts`** (11 tests)
   - User registration
   - Email/password validation
   - Login with valid credentials
   - Invalid credentials error handling
   - Session persistence after refresh
   - Logout functionality
   - Protected route redirects
   - Anonymous catalog migration

5. **`07-circles.spec.ts`** (13 tests)
   - Authentication required for circles
   - Create circle functionality
   - 8-character uppercase invite code generation
   - Join circle via invite code
   - Invalid code error handling
   - Duplicate membership prevention
   - Owner vs Member badges
   - Leave circle (members only)
   - Delete circle (owner only)
   - Member count display

6. **`08-sharing-and-reactions.spec.ts`** (14 tests)
   - Share to circle from portfolio
   - Multi-select batch sharing
   - Shared items feed display
   - 6 emoji reactions (❤️ 😍 👏 ✨ 🔥 😊)
   - Toggle reactions on/off
   - Reaction counts
   - 5 preset compliments
   - Compliment picker and list
   - User avatars with reactions
   - Prevent duplicate reactions
   - Remove shared items

### Configuration Files
- **`playwright.config.ts`** - Main Playwright configuration
  - Ignores HTTPS certificate errors
  - Base URL: https://srv1315945.hstgr.cloud
  - Screenshots/videos on failure
  - Multiple browsers: Desktop Chrome, Mobile Chrome, Mobile Safari, iPad

- **`package.json`** - Updated with test scripts
  - `npm test` - Run all tests
  - `npm run test:ui` - Interactive UI mode
  - `npm run test:headed` - See browser
  - `npm run test:debug` - Debug mode
  - `npm run test:report` - View HTML report

### Documentation
- **`tests/README.md`** - Complete test suite documentation
- **`tests/TROUBLESHOOTING.md`** - Comprehensive debugging guide
- **`tests/fixtures/README.txt`** - Instructions for test images

## 🚀 Quick Start

### 1. Install Playwright
```bash
cd /home/grifin/projects/wrigs-fashion
npm install
npx playwright install
```

### 2. Add Test Images
Place test images in `tests/fixtures/`:
- `test-image.jpg` - Standard JPG (~2MB)
- `test-sketch.png` - Fashion sketch drawing
- `test-heic.heic` - iOS HEIC format (optional)

### 3. Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/05-authentication.spec.ts

# Run with browser visible (headed mode)
npm run test:headed

# Run with interactive UI
npm run test:ui

# Debug single test
npx playwright test -g "should register a new user" --debug
```

## 🔍 What Tests Will Reveal

### Critical Issues to Watch For

**Authentication Problems:**
- ❌ Session not persisting after refresh
- ❌ Login redirects not working
- ❌ Protected routes accessible without auth
- ❌ Cookie domain/SameSite issues

**Image Processing Issues:**
- ❌ Processing takes > 5 seconds (should be 2-4s)
- ❌ HEIC/HEIF uploads failing (iOS photos)
- ❌ Sharp.js dependencies missing
- ❌ Upload directory not writable

**PDF Generation Problems:**
- ❌ PDF generation takes > 10 seconds
- ❌ Canvas library not installed
- ❌ Template SVG files missing
- ❌ Download not triggering

**Database Connection Errors:**
- ❌ MySQL not running
- ❌ Wrong credentials
- ❌ Tables not created (migrations not run)
- ❌ Foreign key constraint failures

**Circle/Sharing Issues:**
- ❌ Can't create circles
- ❌ Invite codes not generating (8-char uppercase)
- ❌ Join via code not working
- ❌ Reactions/compliments not registering
- ❌ Shared items feed empty

## 📊 Test Results Interpretation

### Expected Results (Healthy System)
```
✓ 01-homepage.spec.ts (8/8 passed)
✓ 02-upload-and-process.spec.ts (11/11 passed)
✓ 04-paper-doll-system.spec.ts (15/15 passed)
✓ 05-authentication.spec.ts (11/11 passed)
✓ 07-circles.spec.ts (13/13 passed)
✓ 08-sharing-and-reactions.spec.ts (14/14 passed)

Total: 72 tests passed ✅
```

### Common Failure Patterns

**Pattern 1: All tests fail immediately**
```
✗ Cannot navigate to page (CERT_ERROR)
```
**Cause:** SSL certificate not trusted
**Fix:** Verify `ignoreHTTPSErrors: true` in config

**Pattern 2: Auth tests fail, others pass**
```
✓ Homepage loads
✗ Should register a new user
✗ Should login with credentials
✗ Should persist session
```
**Cause:** AUTH_SECRET not set, Better Auth misconfigured
**Fix:** Check `.env` file, verify Better Auth setup

**Pattern 3: Image tests timeout**
```
✗ Should process image (timeout 30s)
✗ Should show cleaned image
```
**Cause:** Sharp.js not working, processing hangs
**Fix:** Check Docker logs, verify Sharp.js dependencies

**Pattern 4: Circle tests fail at creation**
```
✗ Should create circle (500 error)
✗ Should generate invite code
```
**Cause:** Database tables not created
**Fix:** Run `npm run db:push` in container

**Pattern 5: PDF generation times out**
```
✗ Should generate PDF (timeout 15s)
```
**Cause:** Canvas library not installed, template files missing
**Fix:** Check `npm list canvas`, verify `/static/templates/dolls/` exists

## 🛠️ Debugging Failed Tests

### Step 1: View HTML Report
```bash
npm run test:report
```
- Shows screenshots of failures
- Video recordings of test runs
- Stack traces and error messages

### Step 2: Run Single Test with Debug
```bash
npx playwright test tests/05-authentication.spec.ts --debug
```
- Opens Playwright Inspector
- Step through test line-by-line
- Inspect DOM at each step

### Step 3: Check Application Logs
```bash
docker logs wrigs-fashion -f
```
- Look for API errors
- Check database connection issues
- Verify Sharp.js/PDFKit errors

### Step 4: Inspect Database
```bash
docker exec -it wrigs-fashion mysql -u wrigs_user -p wrigs_fashion

# Check tables exist
SHOW TABLES;

# Check users
SELECT * FROM users LIMIT 5;

# Check sessions
SELECT * FROM sessions WHERE expiresAt > NOW();

# Check circles
SELECT * FROM circles;
```

### Step 5: Manual API Testing
```bash
# Test registration API
curl -k -X POST https://srv1315945.hstgr.cloud/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"manual-test@example.com","password":"Test123!","name":"Manual Test"}'

# Test circles API (requires auth)
curl -k -X GET https://srv1315945.hstgr.cloud/api/circles \
  -H "Cookie: wrigs_session=YOUR_SESSION_COOKIE"
```

## 📈 Performance Benchmarks

Based on CLAUDE.md specifications:

| Operation | Expected Time | Test Threshold |
|-----------|---------------|----------------|
| Image Processing | < 5 seconds | < 5000ms |
| PDF Generation | < 10 seconds | < 10000ms |
| Page Load | < 2 seconds | < 2000ms |
| API Response | < 500ms | < 1000ms |

Tests will flag operations that exceed these thresholds.

## 🔄 Continuous Monitoring

### Run Tests on Schedule
```bash
# Add to cron (run every hour)
0 * * * * cd /home/grifin/projects/wrigs-fashion && npm test > /var/log/wrigs-tests.log 2>&1
```

### CI/CD Integration
Add to `.github/workflows/tests.yml`:
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## ⚠️ Known Limitations

These tests do NOT cover:
- Canvas editor drawing tools (requires complex mouse interactions)
- Catalog drag/resize/rotate (complex canvas manipulation)
- Actual file download verification (browser downloads)
- PDF content inspection (would need PDF parsing library)
- Email verification (not implemented in V1)
- Rate limiting (would need load testing tool)

## 📝 Next Steps

After running tests:
1. Review HTML report for failures
2. Check TROUBLESHOOTING.md for specific issue
3. Fix identified issues
4. Re-run tests to verify fixes
5. Monitor performance metrics

## 🎯 Success Criteria

Application is healthy when:
- ✅ All 72 tests pass
- ✅ No console errors in browser
- ✅ Image processing < 5 seconds
- ✅ PDF generation < 10 seconds
- ✅ Session persists across refreshes
- ✅ All CRUD operations work
- ✅ Circles and sharing functional

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- Project CLAUDE.md - Full technical specification
- PHASE5_IMPLEMENTATION_SUMMARY.md - Circle/Sharing details
