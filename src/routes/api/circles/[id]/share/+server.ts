import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { sharedItems, designs, dollProjects, catalogs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireCircleMembership } from '$lib/utils/circle-permissions';

/**
 * POST /api/circles/[id]/share
 * Share an item to a specific circle
 * Body: { itemType: 'design' | 'dollProject' | 'catalog', itemId: string }
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user is a member of this circle
		await requireCircleMembership(circleId, user.id);

		const body = await request.json();
		const { itemType, itemId } = body;

		// Validate input
		if (!itemType || !['design', 'dollProject', 'catalog'].includes(itemType)) {
			throw error(400, 'Invalid item type. Must be "design", "dollProject", or "catalog"');
		}

		if (!itemId || typeof itemId !== 'string') {
			throw error(400, 'Item ID is required');
		}

		// Verify item belongs to user
		if (itemType === 'design') {
			const design = await db.query.designs.findFirst({
				where: and(eq(designs.id, itemId), eq(designs.userId, user.id))
			});

			if (!design) {
				throw error(404, 'Design not found or you do not have permission to share it');
			}
		} else if (itemType === 'dollProject') {
			const dollProject = await db.query.dollProjects.findFirst({
				where: and(eq(dollProjects.id, itemId), eq(dollProjects.userId, user.id))
			});

			if (!dollProject) {
				throw error(404, 'Paper doll not found or you do not have permission to share it');
			}
		} else if (itemType === 'catalog') {
			const catalog = await db.query.catalogs.findFirst({
				where: and(eq(catalogs.id, itemId), eq(catalogs.userId, user.id))
			});

			if (!catalog) {
				throw error(404, 'Catalog not found or you do not have permission to share it');
			}
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
