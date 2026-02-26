import { json, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { catalogs, catalogItems } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { optionalAuth } from '$lib/server/auth/guards';
import { eq, desc, or, and, inArray } from 'drizzle-orm';
import { createFallbackCatalog, listFallbackCatalogs } from '$lib/server/catalogs-fallback-store';

// POST /api/catalogs — create a new catalog
export const POST: RequestHandler = async ({ cookies, request, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);
	const body = await request.json().catch(() => ({}));
	const title = (body.title as string) || 'My Fashion Catalog';

	try {
		const db = getDb();

		// Enforce max 20 catalogs per user/session
		let whereClause;
		if (user) {
			whereClause = eq(catalogs.userId, user.id);
		} else {
			whereClause = eq(catalogs.sessionId, sessionId);
		}

		const existing = await db.select().from(catalogs).where(whereClause);
		if (existing.length >= 20) {
			return json({ error: 'Maximum 20 catalogs allowed' }, { status: 400 });
		}

		const id = nanoid(12);
		await db.insert(catalogs).values({ id, sessionId, userId: user?.id || null, title: title.slice(0, 200) });
		const [catalog] = await db.select().from(catalogs).where(eq(catalogs.id, id));
		return json(catalog, { status: 201 });
	} catch (e) {
		const catalog = createFallbackCatalog({ sessionId, userId: user?.id || null, title: title.slice(0, 200) });
		return json(catalog, { status: 201 });
	}
};

// GET /api/catalogs — list catalogs for current user or session
export const GET: RequestHandler = async ({ cookies, locals }) => {
	const user = optionalAuth(locals);
	const sessionId = getSessionId(cookies);
	try {
		const db = getDb();
		let whereClause;
		if (user) {
			whereClause = or(eq(catalogs.userId, user.id), eq(catalogs.sessionId, sessionId));
		} else {
			whereClause = eq(catalogs.sessionId, sessionId);
		}

		const catalogList = await db
			.select()
			.from(catalogs)
			.where(whereClause)
			.orderBy(desc(catalogs.updatedAt));

		const catalogIds = catalogList.map((c) => c.id);
		const allItems =
			catalogIds.length > 0
				? await db.select().from(catalogItems).where(inArray(catalogItems.catalogId, catalogIds))
				: [];

		const itemsByLogId = allItems.reduce(
			(acc, item) => {
				if (!acc[item.catalogId]) acc[item.catalogId] = [];
				acc[item.catalogId].push(item);
				return acc;
			},
			{} as Record<string, typeof allItems>
		);

		const results = catalogList.map((catalog) => ({ ...catalog, items: itemsByLogId[catalog.id] || [] }));
		return json(results);
	} catch {
		return json(listFallbackCatalogs({ sessionId, userId: user?.id || null }));
	}
};
