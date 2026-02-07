import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { sharedItems, designs, dollProjects } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireCircleMembership } from '$lib/utils/circle-permissions';

/**
 * POST /api/share
 * Share an item (design or doll project) to multiple circles at once
 * Body: { itemType: 'design' | 'dollProject', itemId: string, circleIds: string[] }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();

	try {
		const body = await request.json();
		const { itemType, itemId, circleIds } = body;

		// Validate input
		if (!itemType || (itemType !== 'design' && itemType !== 'dollProject')) {
			throw error(400, 'Invalid item type. Must be "design" or "dollProject"');
		}

		if (!itemId || typeof itemId !== 'string') {
			throw error(400, 'Item ID is required');
		}

		if (!Array.isArray(circleIds) || circleIds.length === 0) {
			throw error(400, 'At least one circle must be selected');
		}

		// Verify item belongs to user
		if (itemType === 'design') {
			const design = await db.query.designs.findFirst({
				where: and(eq(designs.id, itemId), eq(designs.userId, user.id))
			});

			if (!design) {
				throw error(404, 'Design not found or you do not have permission to share it');
			}
		} else {
			// dollProject
			const dollProject = await db.query.dollProjects.findFirst({
				where: and(eq(dollProjects.id, itemId), eq(dollProjects.userId, user.id))
			});

			if (!dollProject) {
				throw error(404, 'Paper doll not found or you do not have permission to share it');
			}
		}

		// Share to all selected circles
		const results = await Promise.all(
			circleIds.map(async (circleId) => {
				try {
					// Verify user is a member of this circle
					await requireCircleMembership(circleId, user.id);

					// Check if already shared to this circle
					const existing = await db.query.sharedItems.findFirst({
						where: and(
							eq(sharedItems.circleId, circleId),
							eq(sharedItems.itemType, itemType),
							eq(sharedItems.itemId, itemId)
						)
					});

					if (existing) {
						return { circleId, status: 'already_shared' };
					}

					// Share item
					await db.insert(sharedItems).values({
						id: nanoid(12),
						circleId,
						itemType,
						itemId,
						sharedBy: user.id,
						createdAt: new Date()
					});

					return { circleId, status: 'shared' };
				} catch (err: any) {
					console.error(`Error sharing to circle ${circleId}:`, err);
					return { circleId, status: 'error', error: err.message };
				}
			})
		);

		// Count successes
		const sharedCount = results.filter((r) => r.status === 'shared').length;
		const alreadySharedCount = results.filter((r) => r.status === 'already_shared').length;
		const errorCount = results.filter((r) => r.status === 'error').length;

		// Generate message
		let message = '';
		if (sharedCount > 0) {
			message += `Shared to ${sharedCount} circle${sharedCount > 1 ? 's' : ''}! ✨`;
		}
		if (alreadySharedCount > 0) {
			if (message) message += ' ';
			message += `Already shared to ${alreadySharedCount} circle${alreadySharedCount > 1 ? 's' : ''}.`;
		}
		if (errorCount > 0) {
			if (message) message += ' ';
			message += `Failed to share to ${errorCount} circle${errorCount > 1 ? 's' : ''}.`;
		}

		return json(
			{
				success: sharedCount > 0,
				message,
				results
			},
			{ status: sharedCount > 0 ? 201 : 200 }
		);
	} catch (err: any) {
		console.error('Error sharing item:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to share item');
	}
};
