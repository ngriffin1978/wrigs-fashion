import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { sharedItems, designs, dollProjects } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireCircleMembership } from '$lib/utils/circle-permissions';

/**
 * GET /api/shared-items/[id]
 * Get a single shared item with full details (design/doll data)
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const sharedItemId = params.id;

	try {
		// Fetch shared item with relations
		const item = await db.query.sharedItems.findFirst({
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

		if (!item) {
			throw error(404, 'Shared item not found');
		}

		// Verify user has access to the circle
		await requireCircleMembership(item.circleId, user.id);

		// Hydrate design/doll data
		let design = null;
		let dollProject = null;

		if (item.itemType === 'design') {
			design = await db.query.designs.findFirst({
				where: eq(designs.id, item.itemId)
			});
		} else {
			dollProject = await db.query.dollProjects.findFirst({
				where: eq(dollProjects.id, item.itemId),
				with: {
					design: true,
					dollTemplate: true
				}
			});
		}

		// Calculate reaction counts
		const reactionCounts: Record<string, number> = {};
		item.reactions.forEach((reaction) => {
			reactionCounts[reaction.reactionType] = (reactionCounts[reaction.reactionType] || 0) + 1;
		});

		return json({
			sharedItem: {
				...item,
				design,
				dollProject,
				reactionCounts,
				complimentCount: item.compliments.length
			}
		});
	} catch (err: any) {
		console.error('Error fetching shared item:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to load shared item');
	}
};
