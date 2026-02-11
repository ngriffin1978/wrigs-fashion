# Wrigs Fashion - Test Troubleshooting Guide

## Common Test Issues & Solutions

### 1. Certificate Errors
**Problem:** Tests fail with `ERR_CERT_AUTHORITY_INVALID`

**Solution:**
- Verify `ignoreHTTPSErrors: true` is set in `playwright.config.ts`
- Run tests with: `npx playwright test --ignore-https-errors`
- Check that Docker container SSL is properly configured

### 2. Authentication Issues
**Symptoms:**
- Login redirects don't work
- Session doesn't persist after refresh
- "Unauthorized" errors on protected routes

**Debugging Steps:**
```bash
# Check if AUTH_SECRET is set
docker exec -it wrigs-fashion env | grep AUTH

# Check database sessions table
docker exec -it wrigs-fashion mysql -u wrigs_user -p wrigs_fashion
SELECT * FROM sessions LIMIT 5;

# Check cookies in browser DevTools
# Should see: wrigs_session, sessionId
```

**Common Causes:**
- AUTH_SECRET not set or incorrect
- Cookie domain mismatch
- Database connection issues
- Better Auth configuration errors

### 3. Image Upload Failures
**Symptoms:**
- Upload button doesn't work
- Processing hangs or times out
- "Failed to process image" errors

**Debugging Steps:**
```bash
# Check Sharp.js dependencies
docker exec -it wrigs-fashion npm list sharp

# Check upload directory permissions
docker exec -it wrigs-fashion ls -la /app/static/uploads

# Check API logs
docker logs wrigs-fashion 2>&1 | grep -i "upload\|sharp\|error"
```

**Common Causes:**
- Sharp.js not properly installed (missing libvips)
- File size exceeds 10MB limit
- Upload directory not writable
- HEIC/HEIF format not supported (need Sharp dependencies)

### 4. PDF Generation Issues
**Symptoms:**
- PDF generation hangs
- "Failed to generate PDF" errors
- PDF download doesn't start

**Debugging Steps:**
```bash
# Check PDFKit installation
docker exec -it wrigs-fashion npm list pdfkit

# Check PDF output directory
docker exec -it wrigs-fashion ls -la /app/static/pdfs

# Check for canvas library issues
docker exec -it wrigs-fashion npm list canvas
```

**Common Causes:**
- Canvas library not installed (needed for image embedding)
- PDF directory not writable
- Template SVG files missing
- Design image URL invalid

### 5. Database Connection Errors
**Symptoms:**
- "Connection refused" errors
- "Database not found"
- CRUD operations fail

**Debugging Steps:**
```bash
# Check if MySQL is running
docker exec -it wrigs-fashion ps aux | grep mysql

# Test database connection
docker exec -it wrigs-fashion mysql -u wrigs_user -p -e "SELECT 1"

# Check DATABASE_URL
docker exec -it wrigs-fashion env | grep DATABASE_URL
```

**Common Causes:**
- MySQL not started in Docker container
- Wrong credentials in .env
- Database not created
- Network issues in Docker

### 6. Circle/Sharing Features Not Working
**Symptoms:**
- Can't create circles
- Invite codes not generating
- Share modal doesn't open
- Reactions don't register

**Debugging Steps:**
```bash
# Check if circles tables exist
docker exec -it wrigs-fashion mysql -u wrigs_user -p wrigs_fashion
SHOW TABLES LIKE 'circle%';
DESC circles;

# Check for JavaScript errors
# Open browser console and look for errors

# Verify API endpoints
curl -k https://srv1315945.hstgr.cloud/api/circles
```

**Common Causes:**
- Database migrations not run (`npm run db:push`)
- JavaScript errors in frontend
- API routes not working
- Authentication required but user not logged in

### 7. Page Not Found (404) Errors
**Symptoms:**
- Routes return 404
- Navigation doesn't work
- Assets not loading

**Debugging Steps:**
```bash
# Check if SvelteKit app is running
docker exec -it wrigs-fashion ps aux | grep node

# Check Nginx configuration
docker exec -it wrigs-fashion nginx -t

# Check app logs
docker logs wrigs-fashion -f
```

**Common Causes:**
- SvelteKit not running (build failed)
- Nginx misconfiguration
- Port mapping issues
- Routes not properly defined

### 8. Slow Performance
**Symptoms:**
- Image processing takes >5 seconds
- PDF generation takes >10 seconds
- Pages load slowly

**Debugging Steps:**
```bash
# Check CPU/Memory usage
docker stats wrigs-fashion

# Check running processes
docker exec -it wrigs-fashion top

# Check database query performance
# Enable query logging in MySQL
```

**Common Causes:**
- Insufficient resources (CPU/RAM)
- Large image files
- Database not indexed
- Too many concurrent requests

### 9. Session Not Persisting
**Symptoms:**
- User logged out after refresh
- Auth state lost on navigation
- "Please login" errors

**Debugging Steps:**
```bash
# Check cookie settings in browser DevTools
# Application > Cookies

# Verify session expiry
docker exec -it wrigs-fashion mysql -u wrigs_user -p wrigs_fashion
SELECT id, userId, expiresAt FROM sessions WHERE userId = 'user-id';

# Check Better Auth configuration
# /src/lib/server/auth/config.ts - verify session settings
```

**Common Causes:**
- Cookie SameSite/Secure flags incorrect
- Session expired (30-day default)
- Browser blocking third-party cookies
- Domain mismatch (localhost vs production domain)

### 10. File Upload Format Issues
**Symptoms:**
- HEIC files rejected
- "Unsupported format" errors
- iOS photos don't upload

**Debugging Steps:**
```bash
# Check Sharp.js HEIC support
docker exec -it wrigs-fashion node -e "const sharp = require('sharp'); console.log(sharp.versions)"

# Check file input accept attribute
# Look at input[type="file"] accept attribute in HTML
```

**Common Causes:**
- Sharp.js built without HEIC support
- File input not accepting image/heic
- Sharp dependencies missing (libheif)

## Running Tests in Debug Mode

### Single Test Debugging
```bash
# Run single test file
npx playwright test tests/05-authentication.spec.ts --debug

# Run specific test by name
npx playwright test -g "should register a new user"

# Run with UI mode (interactive)
npx playwright test --ui
```

### Viewing Test Reports
```bash
# Generate and open HTML report
npx playwright show-report

# View trace for failed test
npx playwright show-trace test-results/...trace.zip
```

### Capturing Additional Debug Info
```bash
# Run with verbose logging
DEBUG=pw:api npx playwright test

# Capture video for all tests
# Set in playwright.config.ts: video: 'on'

# Take screenshots at each step
# Add to test: await page.screenshot({ path: 'step-1.png' });
```

## API Endpoint Testing

### Manual API Tests
```bash
# Test registration endpoint
curl -k -X POST https://srv1315945.hstgr.cloud/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test circles endpoint (requires auth cookie)
curl -k -X GET https://srv1315945.hstgr.cloud/api/circles \
  -H "Cookie: wrigs_session=..."

# Test upload endpoint
curl -k -X POST https://srv1315945.hstgr.cloud/api/upload \
  -F "image=@test-image.jpg"
```

## Database Inspection

### Check Tables
```sql
-- Show all tables
SHOW TABLES;

-- Check users
SELECT id, email, name, createdAt FROM users LIMIT 5;

-- Check circles
SELECT id, name, inviteCode, ownerId FROM circles LIMIT 5;

-- Check shared items
SELECT id, circleId, itemType, itemId, sharedBy FROM sharedItems LIMIT 5;

-- Check reactions
SELECT reactionType, COUNT(*) as count
FROM reactions
GROUP BY reactionType;
```

### Database Reset (Development Only)
```bash
# Drop and recreate database
docker exec -it wrigs-fashion mysql -u root -p
DROP DATABASE wrigs_fashion;
CREATE DATABASE wrigs_fashion;
exit

# Re-run migrations
docker exec -it wrigs-fashion npm run db:push
```

## Environment Variable Checklist

Required `.env` variables:
```bash
✓ DATABASE_URL           # MySQL connection string
✓ AUTH_SECRET            # 32-character random key
✓ PUBLIC_APP_URL         # https://srv1315945.hstgr.cloud
✓ NODE_ENV               # production
```

Optional variables:
```bash
○ R2_ACCOUNT_ID          # Cloudflare R2 (not used in Docker)
○ R2_ACCESS_KEY_ID       # Cloudflare R2
○ R2_SECRET_ACCESS_KEY   # Cloudflare R2
○ R2_BUCKET_NAME         # Cloudflare R2
```

## Useful Docker Commands

```bash
# View logs
docker logs wrigs-fashion -f

# Access container shell
docker exec -it wrigs-fashion /bin/bash

# Restart container
docker restart wrigs-fashion

# Check container status
docker ps | grep wrigs

# View resource usage
docker stats wrigs-fashion

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Getting Help

If tests continue to fail:
1. Check Docker logs: `docker logs wrigs-fashion`
2. Check browser console for JavaScript errors
3. Verify all migrations ran: `npm run db:push`
4. Check file permissions in `/static` directories
5. Verify Sharp.js and PDFKit are properly installed
6. Review CLAUDE.md for known issues

## Test Coverage Summary

Current test files cover:
- ✅ Homepage and navigation
- ✅ Authentication (register/login/logout)
- ✅ Image upload and processing
- ✅ Paper doll template system
- ✅ PDF generation
- ✅ Circles (create/join/leave)
- ✅ Sharing (multi-select batch share)
- ✅ Reactions (6 emoji types)
- ✅ Compliments (5 preset phrases)

Missing test coverage:
- ⚠️ Canvas editor tools (6 drawing tools)
- ⚠️ Catalog system (drag/resize/rotate)
- ⚠️ Portfolio CRUD operations
- ⚠️ Achievement badges
- ⚠️ Mobile/tablet responsiveness
- ⚠️ Accessibility (ARIA, keyboard navigation)
