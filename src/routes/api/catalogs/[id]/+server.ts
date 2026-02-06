import { json, error, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { optionalAuth } from '$lib/server/auth/guards';
import { eq, and, or } from 'drizzle-orm';

// GET /api/catalogs/:id — get catalog with items
export const GET: RequestHandler = async ({ params, cookies, locals }) => {
	const user = optionalAuth(locals);
	const db = getDb();
	const catalog = await db.query.catalogs.findFirst({
		where: eq(catalogs.id, params.id!),
		with: { items: true }
	});

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	// Allow access if owner (by userId OR sessionId) or public
	const sessionId = getSessionId(cookies);
	const isOwner =
		(user && catalog.userId === user.id) || catalog.sessionId === sessionId;

	if (!isOwner && !catalog.isPublic) {
		throw error(404, 'Catalog not found');
	}

	return json(catalog);
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
