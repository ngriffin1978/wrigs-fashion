# Better Auth Implementation Guide

This guide provides detailed information about the Better Auth implementation in Wrigs Fashion.

## Why Better Auth?

Chosen over Lucia Auth (deprecated) and NextAuth for:
- Modern, actively maintained (v1.4.18)
- Built-in Drizzle ORM adapter
- Simple email/password authentication
- Cookie-based sessions out of the box
- Easy MySQL integration
- TypeScript-first design

## Setup Process (Already Completed)

### 1. Install Better Auth
```bash
npm install better-auth
```

### 2. Database Schema
Better Auth requires 4 tables (already in `schema.ts`):
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth providers (reserved for V2)
- `verifications` - Email verification tokens (reserved for V2)

### 3. Auth Configuration
File: `/src/lib/server/auth/config.ts`
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'mysql',
    schema: { user, session, account, verification }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // V1: disabled
    minPasswordLength: 8
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30 // 30 days
  },
  secret: env.AUTH_SECRET,
  baseURL: env.PUBLIC_APP_URL
});
```

### 4. Global Auth Middleware
File: `/src/hooks.server.ts`
```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (session) {
    event.locals.user = {
      id: session.user.id,
      email: session.user.email,
      nickname: session.user.name,
      // ... other fields
    };
  }

  return await resolve(event);
};
```

### 5. API Endpoints Pattern
All auth endpoints follow this pattern:

```typescript
// Create a proper Request for Better Auth
const authRequest = new Request('http://localhost/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});

// Call Better Auth handler
const authResponse = await auth.handler(authRequest);
const data = await authResponse.json();

// Extract and set session cookie
const setCookieHeader = authResponse.headers.get('set-cookie');
// Parse and set cookie manually in SvelteKit
```

### 6. Route Protection
File: `/src/lib/server/auth/guards.ts`
```typescript
export function requireAuth(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(303, '/auth/login');
  }
  return locals.user;
}
```

Usage in `+page.server.ts`:
```typescript
export const load: PageServerLoad = async ({ locals }) => {
  const user = requireAuth(locals);
  // ... fetch user-specific data
};
```

## Key Differences from Other Auth Libraries

### Better Auth vs Lucia Auth
- Lucia is deprecated (no longer maintained)
- Better Auth has built-in Drizzle adapter
- Better Auth handles Request/Response pattern natively

### Better Auth vs NextAuth
- Better Auth is framework-agnostic
- Simpler configuration for basic auth
- Native TypeScript support
- Better Drizzle ORM integration

## Common Patterns

### Accessing User in Server Code
```typescript
// In +page.server.ts
export const load = async ({ locals }) => {
  if (locals.user) {
    // User is authenticated
    const userId = locals.user.id;
  }
};
```

### Accessing User in API Routes
```typescript
// In +server.ts
export const POST = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }
  const userId = locals.user.id;
};
```

### Client-Side Auth State
Not directly available - use server load functions to pass user data to pages.

## Troubleshooting

### Issue: Session not persisting
- Check AUTH_SECRET is set in `.env`
- Verify cookie is being set (check browser DevTools)
- Ensure `baseURL` matches your app URL

### Issue: "User not found" after registration
- Check database migrations ran successfully
- Verify Better Auth created the user in `users` table
- Check `users.name` field is set (not null)

### Issue: Cookie not setting in SvelteKit
- Must manually parse and set cookie from Better Auth response
- Use `cookies.set()` in SvelteKit API routes
- See `/src/routes/api/auth/register/+server.ts` for reference

## Environment Variables

Required for production:
```bash
AUTH_SECRET="your_32_character_random_secret_key"
DATABASE_URL="mysql://user:pass@host:port/db"
PUBLIC_APP_URL="https://yourdomain.com"
BETTER_AUTH_URL="https://yourdomain.com"  # Optional, defaults to PUBLIC_APP_URL
```

## Database Tables

Better Auth Required Tables:
- `users` - User accounts (id, email, password, name, image, role)
- `sessions` - Active sessions (id, userId, expiresAt, token)
- `accounts` - OAuth accounts (not used in V1, reserved for V2)
- `verifications` - Email verification tokens (not used in V1)
