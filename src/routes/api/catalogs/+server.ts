import { json, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { eq, desc } from 'drizzle-orm';

// POST /api/catalogs — create a new catalog
export const POST: RequestHandler = async ({ cookies, request }) => {
	const sessionId = getSessionId(cookies);
	const body = await request.json().catch(() => ({}));
	const title = (body.title as string) || 'My Fashion Catalog';

	const db = getDb();

	// Enforce max 20 catalogs per session
	const existing = await db.select().from(catalogs).where(eq(catalogs.sessionId, sessionId));
	if (existing.length >= 20) {
		return json({ error: 'Maximum 20 catalogs allowed' }, { status: 400 });
	}

	const id = nanoid(12);
	await db.insert(catalogs).values({
		id,
		sessionId,
		title: title.slice(0, 200)
	});

	const [catalog] = await db.select().from(catalogs).where(eq(catalogs.id, id));
	return json(catalog, { status: 201 });
};

// GET /api/catalogs — list catalogs for current session
export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = getSessionId(cookies);
	const db = getDb();

	const results = await db.query.catalogs.findMany({
		where: eq(catalogs.sessionId, sessionId),
		with: { items: true },
		orderBy: [desc(catalogs.updatedAt)]
	});

	return json(results);
};
