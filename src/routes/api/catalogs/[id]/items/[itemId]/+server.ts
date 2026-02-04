import { json, error, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { catalogs, catalogItems } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { eq, and } from 'drizzle-orm';

// PATCH /api/catalogs/:id/items/:itemId — update item position/size/rotation
export const PATCH: RequestHandler = async ({ params, cookies, request }) => {
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

	const [item] = await db
		.select()
		.from(catalogItems)
		.where(and(eq(catalogItems.id, params.itemId!), eq(catalogItems.catalogId, params.id!)));

	if (!item) {
		throw error(404, 'Item not found');
	}

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if (typeof body.positionX === 'number') updates.positionX = body.positionX;
	if (typeof body.positionY === 'number') updates.positionY = body.positionY;
	if (typeof body.width === 'number') updates.width = Math.min(Math.max(body.width, 80), 800);
	if (typeof body.height === 'number') updates.height = Math.min(Math.max(body.height, 80), 800);
	if (typeof body.rotation === 'number') updates.rotation = body.rotation;
	if (typeof body.zIndex === 'number') updates.zIndex = body.zIndex;

	if (Object.keys(updates).length > 0) {
		await db.update(catalogItems).set(updates).where(eq(catalogItems.id, params.itemId!));
	}

	const [updated] = await db.select().from(catalogItems).where(eq(catalogItems.id, params.itemId!));
	return json(updated);
};

// DELETE /api/catalogs/:id/items/:itemId — remove item from catalog
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const sessionId = getSessionId(cookies);
	const db = getDb();

	const [catalog] = await db
		.select()
		.from(catalogs)
		.where(and(eq(catalogs.id, params.id!), eq(catalogs.sessionId, sessionId)));

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	const [item] = await db
		.select()
		.from(catalogItems)
		.where(and(eq(catalogItems.id, params.itemId!), eq(catalogItems.catalogId, params.id!)));

	if (!item) {
		throw error(404, 'Item not found');
	}

	await db.delete(catalogItems).where(eq(catalogItems.id, params.itemId!));
	return json({ success: true });
};
