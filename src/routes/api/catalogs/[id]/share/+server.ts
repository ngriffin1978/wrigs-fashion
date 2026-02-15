import { json, error, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { eq, and, or } from 'drizzle-orm';
import { requireAuth } from '$lib/server/auth/guards';

// POST /api/catalogs/:id/share — toggle public sharing and generate/revoke share slug
export const POST: RequestHandler = async ({ params, cookies, request, locals }) => {
	const sessionId = getSessionId(cookies);
	const db = getDb();

	// Check if user is authenticated
	let userId = null;
	try {
		const user = requireAuth(locals);
		userId = user.id;
	} catch {
		// Not authenticated, continue with session only
	}

	// Find catalog by sessionId OR userId
	const catalog = await db.query.catalogs.findFirst({
		where: or(
			eq(catalogs.id, params.id!),
			userId ? eq(catalogs.userId, userId) : undefined,
			eq(catalogs.sessionId, sessionId)
		)
	});

	// More precise check
	let catalogToUpdate = null;
	if (catalog) {
		if (catalog.sessionId === sessionId || (userId && catalog.userId === userId)) {
			catalogToUpdate = catalog;
		}
	}

	if (!catalogToUpdate) {
		throw error(404, 'Catalog not found');
	}

	const body = await request.json();
	const makePublic = body.isPublic === true;

	if (makePublic) {
		// Generate a share slug if not already set
		const shareSlug = catalogToUpdate.shareSlug || nanoid(12);
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
