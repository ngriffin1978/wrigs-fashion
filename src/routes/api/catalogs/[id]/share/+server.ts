import { json, error, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { eq, and } from 'drizzle-orm';

// POST /api/catalogs/:id/share — toggle public sharing and generate/revoke share slug
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const sessionId = getSessionId(cookies);
	const db = getDb();

	const [catalog] = await db
		.select()
		.from(catalogs)
		.where(and(eq(catalogs.id, params.id!), eq(catalogs.sessionId, sessionId)));

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	const body = await request.json();
	const makePublic = body.isPublic === true;

	if (makePublic) {
		// Generate a share slug if not already set
		const shareSlug = catalog.shareSlug || nanoid(12);
		await db
			.update(catalogs)
			.set({ isPublic: true, shareSlug })
			.where(eq(catalogs.id, params.id!));

		const [updated] = await db.select().from(catalogs).where(eq(catalogs.id, params.id!));
		return json({ ...updated, shareUrl: `/catalogs/share/${shareSlug}` });
	} else {
		// Revoke public access (keep slug for potential re-enable)
		await db.update(catalogs).set({ isPublic: false }).where(eq(catalogs.id, params.id!));
		const [updated] = await db.select().from(catalogs).where(eq(catalogs.id, params.id!));
		return json(updated);
	}
};
