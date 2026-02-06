import { json, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { optionalAuth } from '$lib/server/auth/guards';
import { eq, desc, or, and } from 'drizzle-orm';

// POST /api/catalogs — create a new catalog
export const POST: RequestHandler = async ({ cookies, request, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);
	const body = await request.json().catch(() => ({}));
	const title = (body.title as string) || 'My Fashion Catalog';

	const db = getDb();

	// Enforce max 20 catalogs per user/session
	let whereClause;
	if (user) {
		// For authenticated users, check by userId
		whereClause = eq(catalogs.userId, user.id);
	} else {
		// For anonymous users, check by sessionId
		whereClause = eq(catalogs.sessionId, sessionId);
	}

	const existing = await db.select().from(catalogs).where(whereClause);
	if (existing.length >= 20) {
		return json({ error: 'Maximum 20 catalogs allowed' }, { status: 400 });
	}

	const id = nanoid(12);
	await db.insert(catalogs).values({
		id,
		sessionId,
		userId: user?.id || null,
		title: title.slice(0, 200)
	});

	const [catalog] = await db.select().from(catalogs).where(eq(catalogs.id, id));
	return json(catalog, { status: 201 });
};

// GET /api/catalogs — list catalogs for current user or session
export const GET: RequestHandler = async ({ cookies, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);
	const db = getDb();

	// Build where clause for dual ownership
	// Prioritize userId if authenticated, otherwise use sessionId
	let whereClause;
	if (user) {
		// For authenticated users, get catalogs by userId OR sessionId (to catch any orphaned catalogs)
		whereClause = or(eq(catalogs.userId, user.id), eq(catalogs.sessionId, sessionId));
	} else {
		// For anonymous users, only get catalogs by sessionId
		whereClause = eq(catalogs.sessionId, sessionId);
	}

	const results = await db.query.catalogs.findMany({
		where: whereClause,
		with: { items: true },
		orderBy: [desc(catalogs.updatedAt)]
	});

	return json(results);
};
