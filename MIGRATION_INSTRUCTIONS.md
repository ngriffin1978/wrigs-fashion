# Database Migration - Schema Sync Fix

## Issue (RESOLVED)
The initial database migration file (`0000_secret_kulan_gath.sql`) was out of sync with the TypeScript schema and actual database.

**Fixed:**
- ✅ `users` table: Changed `nickname` → `name`, `avatar_url` → `image` (Better Auth standard)
- ✅ `users` table: Added `updated_at` timestamp column
- ✅ `accounts` table: Added `password` field (Better Auth email/password auth)

## Current Status
The migration file now matches both:
- The TypeScript schema in `src/lib/server/db/schema.ts`
- The actual database schema currently running

## For Fresh Database Setup

```bash
# Apply migrations (will create correct schema from start)
npm run db:migrate
```

## For Existing Databases
If your database was created before this fix, columns are likely already correct. Verify with:

```bash
docker exec wrigs-fashion-db-dev mysql -u wrigs_user -ppassword -e "DESCRIBE users;" wrigs_fashion
docker exec wrigs-fashion-db-dev mysql -u wrigs_user -ppassword -e "DESCRIBE accounts;" wrigs_fashion
```

Expected `users` columns:
- `name` (not `nickname`)
- `image` (not `avatar_url`)
- `updated_at` timestamp

Expected `accounts` columns:
- Should include `password` field
