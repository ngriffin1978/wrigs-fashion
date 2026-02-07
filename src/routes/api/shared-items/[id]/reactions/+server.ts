import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { reactions, compliments, sharedItems } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireCircleMembership } from '$lib/utils/circle-permissions';

/**
 * GET /api/shared-items/[id]/reactions
 * Get all reactions and compliments for a shared item with user data
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const sharedItemId = params.id;

	try {
		// Find shared item
		const item = await db.query.sharedItems.findFirst({
			where: eq(sharedItems.id, sharedItemId)
		});

		if (!item) {
			throw error(404, 'Shared item not found');
		}

		// Verify user has access to the circle
		await requireCircleMembership(item.circleId, user.id);

		// Fetch reactions with user data
		const reactionsList = await db.query.reactions.findMany({
			where: eq(reactions.sharedItemId, sharedItemId),
			with: {
				user: true
			},
			orderBy: [desc(reactions.createdAt)]
		});

		// Fetch compliments with user data
		const complimentsList = await db.query.compliments.findMany({
			where: eq(compliments.sharedItemId, sharedItemId),
			with: {
				user: true
			},
			orderBy: [desc(compliments.createdAt)]
		});

		// Calculate reaction counts by type
		const reactionCounts: Record<string, number> = {};
		reactionsList.forEach((reaction) => {
			reactionCounts[reaction.reactionType] = (reactionCounts[reaction.reactionType] || 0) + 1;
		});

		// Check which reactions the current user has given
		const userReactions = reactionsList
			.filter((r) => r.userId === user.id)
			.map((r) => r.reactionType);

		return json({
			reactions: reactionsList,
			compliments: complimentsList,
			reactionCounts,
			userReactions,
			totalReactions: reactionsList.length,
			totalCompliments: complimentsList.length
		});
	} catch (err: any) {
		console.error('Error fetching reactions:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to load reactions');
	}
};
