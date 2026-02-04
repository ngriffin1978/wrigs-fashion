import { json, error, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { catalogs, catalogItems } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { eq, and } from 'drizzle-orm';

// POST /api/catalogs/:id/items — add an item to a catalog
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const sessionId = getSessionId(cookies);
	const db = getDb();

	// Verify catalog ownership
	const [catalog] = await db
		.select()
		.from(catalogs)
		.where(and(eq(catalogs.id, params.id!), eq(catalogs.sessionId, sessionId)));

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	// Check item limit
	const existingItems = await db
		.select()
		.from(catalogItems)
		.where(eq(catalogItems.catalogId, params.id!));

	if (existingItems.length >= 30) {
		return json({ error: 'Maximum 30 items per catalog' }, { status: 400 });
	}

	const body = await request.json();
	if (!body.imageUrl || typeof body.imageUrl !== 'string') {
		return json({ error: 'imageUrl is required' }, { status: 400 });
	}

	const id = nanoid(12);
	const maxZ = existingItems.reduce((max, item) => Math.max(max, item.zIndex), 0);

	await db.insert(catalogItems).values({
		id,
		catalogId: params.id!,
		imageUrl: body.imageUrl,
		positionX: typeof body.positionX === 'number' ? body.positionX : 100 + Math.random() * 200,
		positionY: typeof body.positionY === 'number' ? body.positionY : 100 + Math.random() * 200,
		width: typeof body.width === 'number' ? Math.min(Math.max(body.width, 80), 800) : 200,
		height: typeof body.height === 'number' ? Math.min(Math.max(body.height, 80), 800) : 200,
		rotation: 0,
		zIndex: maxZ + 1
	});

	const [item] = await db.select().from(catalogItems).where(eq(catalogItems.id, id));
	return json(item, { status: 201 });
};

// GET /api/catalogs/:id/items — list items in a catalog
export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionId = getSessionId(cookies);
	const db = getDb();

	const [catalog] = await db.select().from(catalogs).where(eq(catalogs.id, params.id!));

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	if (catalog.sessionId !== sessionId && !catalog.isPublic) {
		throw error(404, 'Catalog not found');
	}

	const items = await db
		.select()
		.from(catalogItems)
		.where(eq(catalogItems.catalogId, params.id!));

	return json(items);
};
