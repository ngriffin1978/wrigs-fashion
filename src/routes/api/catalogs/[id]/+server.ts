import { json, error, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { catalogs, catalogItems } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { optionalAuth } from '$lib/server/auth/guards';
import { eq, and, or } from 'drizzle-orm';

// GET /api/catalogs/:id — get catalog with items
export const GET: RequestHandler = async ({ params, cookies, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);

	console.log('[GET /api/catalogs/:id] Request for catalog:', {
		catalogId: params.id,
		requestSessionId: sessionId,
		requestUserId: user?.id || null,
		hasUser: !!user
	});

	const db = getDb();
	// Fetch catalog without LATERAL joins (MySQL compatibility fix)
	const [catalog] = await db.select().from(catalogs).where(eq(catalogs.id, params.id!));

	if (!catalog) {
		console.log('[GET /api/catalogs/:id] ❌ CATALOG NOT FOUND IN DB');
		throw error(404, 'Catalog not found');
	}

	// Fetch items separately
	const items = await db.select().from(catalogItems).where(eq(catalogItems.catalogId, catalog.id));

	console.log('[GET /api/catalogs/:id] Catalog found in DB:', {
		catalogId: catalog.id,
		catalogSessionId: catalog.sessionId,
		catalogUserId: catalog.userId,
		isPublic: catalog.isPublic
	});

	// Allow access if owner (by userId OR sessionId) or public
	const userIdMatch = user && catalog.userId === user.id;
	const sessionIdMatch = catalog.sessionId === sessionId;
	const isOwner = userIdMatch || sessionIdMatch;

	console.log('[GET /api/catalogs/:id] Ownership check:', {
		userIdMatch,
		sessionIdMatch,
		isOwner,
		isPublic: catalog.isPublic,
		willAllow: isOwner || catalog.isPublic
	});

	if (!isOwner && !catalog.isPublic) {
		console.log('[GET /api/catalogs/:id] ❌ ACCESS DENIED - Not owner and not public');
		throw error(404, 'Catalog not found');
	}

	console.log('[GET /api/catalogs/:id] ✅ Access granted');
	return json({ ...catalog, items });
};

// PATCH /api/catalogs/:id — update catalog metadata
export const PATCH: RequestHandler = async ({ params, cookies, request, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);
	const db = getDb();

	// Check ownership via userId OR sessionId
	let whereClause;
	if (user) {
		whereClause = and(
			eq(catalogs.id, params.id!),
			or(eq(catalogs.userId, user.id), eq(catalogs.sessionId, sessionId))
		);
	} else {
		whereClause = and(eq(catalogs.id, params.id!), eq(catalogs.sessionId, sessionId));
	}

	const [catalog] = await db.select().from(catalogs).where(whereClause);

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if (typeof body.title === 'string') updates.title = body.title.slice(0, 200);
	if (typeof body.backgroundColor === 'string') updates.backgroundColor = body.backgroundColor;
	if (typeof body.backgroundPattern === 'string') updates.backgroundPattern = body.backgroundPattern;

	if (Object.keys(updates).length > 0) {
		await db.update(catalogs).set(updates).where(eq(catalogs.id, params.id!));
	}

	const [updated] = await db.select().from(catalogs).where(eq(catalogs.id, params.id!));
	return json(updated);
};

// DELETE /api/catalogs/:id — delete catalog
export const DELETE: RequestHandler = async ({ params, cookies, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);
	const db = getDb();

	// Check ownership via userId OR sessionId
	let whereClause;
	if (user) {
		whereClause = and(
			eq(catalogs.id, params.id!),
			or(eq(catalogs.userId, user.id), eq(catalogs.sessionId, sessionId))
		);
	} else {
		whereClause = and(eq(catalogs.id, params.id!), eq(catalogs.sessionId, sessionId));
	}

	const [catalog] = await db.select().from(catalogs).where(whereClause);

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	await db.delete(catalogs).where(eq(catalogs.id, params.id!));
	return json({ success: true });
};
