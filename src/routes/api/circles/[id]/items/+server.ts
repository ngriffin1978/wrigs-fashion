import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { sharedItems, catalogs } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireCircleMembership, isCircleOwner } from '$lib/utils/circle-permissions';

/**
 * GET /api/circles/[id]/items
 * Get all shared items in a circle with hydrated design/doll/catalog data
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user has access to this circle
		await requireCircleMembership(circleId, user.id);

		// Fetch shared items with relations
		const items = await db.query.sharedItems.findMany({
			where: eq(sharedItems.circleId, circleId),
			with: {
				sharedByUser: true,
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
			},
			orderBy: [desc(sharedItems.createdAt)]
		});

		// Hydrate catalog data (only catalogs are shared to circles)
		const hydrated = await Promise.all(
			items.map(async (item) => {
				// Only handle catalogs - older design/dollProject shares are ignored
				if (item.itemType === 'catalog') {
					const catalog = await db.query.catalogs.findFirst({
						where: eq(catalogs.id, item.itemId)
					});
					return { ...item, catalog, design: null, dollProject: null };
				}
				// Skip non-catalog items
				return null;
			})
		);

		// Filter out nulls and deleted catalogs
		const validItems = hydrated.filter((item): item is NonNullable<typeof item> => item !== null && item.catalog !== null);

		// Add reaction counts for each item
		const itemsWithCounts = validItems.map((item) => {
			const reactionCounts: Record<string, number> = {};
			item.reactions.forEach((reaction) => {
				reactionCounts[reaction.reactionType] = (reactionCounts[reaction.reactionType] || 0) + 1;
			});

			return {
				...item,
				reactionCounts,
				complimentCount: item.compliments.length
			};
		});

		return json({
			items: itemsWithCounts,
			total: itemsWithCounts.length
		});
	} catch (err: any) {
		console.error('Error fetching shared items:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to load shared items');
	}
};

/**
 * DELETE /api/circles/[id]/items
 * Remove a shared item from a circle
 * Body: { sharedItemId: string }
 * User can remove their own items OR owner can remove any item
 */
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user has access to this circle
		await requireCircleMembership(circleId, user.id);

		const body = await request.json();
		const { sharedItemId } = body;

		if (!sharedItemId || typeof sharedItemId !== 'string') {
			throw error(400, 'Shared item ID is required');
		}

		// Find shared item
		const item = await db.query.sharedItems.findFirst({
			where: and(eq(sharedItems.id, sharedItemId), eq(sharedItems.circleId, circleId))
		});

		if (!item) {
			throw error(404, 'Shared item not found');
		}

		// Check permission: user must be the sharer OR the circle owner
		const owner = await isCircleOwner(circleId, user.id);
		const isSharer = item.sharedBy === user.id;

		if (!isSharer && !owner) {
			throw error(403, 'You do not have permission to remove this item');
		}

		// Delete shared item (cascade deletes reactions and compliments)
		await db.delete(sharedItems).where(eq(sharedItems.id, sharedItemId));

		return json({
			success: true,
			message: 'Item removed from circle'
		});
	} catch (err: any) {
		console.error('Error removing shared item:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to remove shared item');
	}
};
