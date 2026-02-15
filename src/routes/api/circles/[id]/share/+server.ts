import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { sharedItems, catalogs } from '$lib/server/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireCircleMembership } from '$lib/utils/circle-permissions';
import { getSessionId } from '$lib/server/session';

/**
 * POST /api/circles/[id]/share
 * Share a catalog to a specific circle
 * Body: { itemType: 'catalog', itemId: string }
 */
export const POST: RequestHandler = async ({ params, request, locals, cookies }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;
	const sessionId = getSessionId(cookies);

	try {
		// Verify user is a member of this circle
		await requireCircleMembership(circleId, user.id);

		const body = await request.json();
		const { itemType, itemId } = body;

		// Validate input - only catalogs for now
		if (!itemType || itemType !== 'catalog') {
			throw error(400, 'Invalid item type. Only catalogs can be shared to circles.');
		}

		if (!itemId || typeof itemId !== 'string') {
			throw error(400, 'Item ID is required');
		}

		// Verify catalog belongs to user
		const catalog = await db.query.catalogs.findFirst({
			where: and(
				eq(catalogs.id, itemId),
				or(eq(catalogs.userId, user.id), eq(catalogs.sessionId, sessionId))
			)
		});

		if (!catalog) {
			throw error(404, 'Catalog not found or you do not have permission to share it');
		}

		// Check if already shared
		const existing = await db.query.sharedItems.findFirst({
			where: and(
				eq(sharedItems.circleId, circleId),
				eq(sharedItems.itemType, itemType),
				eq(sharedItems.itemId, itemId)
			)
		});

		if (existing) {
			throw error(400, 'This item is already shared to this circle');
		}

		// Share item
		const sharedItemId = nanoid(12);
		await db.insert(sharedItems).values({
			id: sharedItemId,
			circleId,
			itemType,
			itemId,
			sharedBy: user.id,
			createdAt: new Date()
		});

		// Fetch created shared item with relations
		const newSharedItem = await db.query.sharedItems.findFirst({
			where: eq(sharedItems.id, sharedItemId),
			with: {
				sharedByUser: true,
				circle: true,
				reactions: {
					with: {
						user: true
					}
				},
				compliments: {
					with: {
						user: true
					}
				}
			}
		});

		return json(
			{
				sharedItem: newSharedItem,
				message: 'Shared to circle! ✨'
			},
			{ status: 201 }
		);
	} catch (err: any) {
		console.error('Error sharing item:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to share item');
	}
};
