import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { reactions, sharedItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireCircleMembership } from '$lib/utils/circle-permissions';

// Valid reaction types
const VALID_REACTIONS = ['love', 'creative', 'amazing', 'fire', 'star', 'applause'];

/**
 * POST /api/shared-items/[id]/react
 * Toggle a reaction on a shared item
 * Body: { reactionType: string }
 * If user already reacted with this type, remove it (toggle off)
 * If user hasn't reacted, add it (toggle on)
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const sharedItemId = params.id;

	try {
		const body = await request.json();
		const { reactionType } = body;

		// Validate reaction type
		if (!reactionType || typeof reactionType !== 'string') {
			throw error(400, 'Reaction type is required');
		}

		if (!VALID_REACTIONS.includes(reactionType)) {
			throw error(400, `Invalid reaction type. Must be one of: ${VALID_REACTIONS.join(', ')}`);
		}

		// Find shared item
		const item = await db.query.sharedItems.findFirst({
			where: eq(sharedItems.id, sharedItemId)
		});

		if (!item) {
			throw error(404, 'Shared item not found');
		}

		// Verify user has access to the circle
		await requireCircleMembership(item.circleId, user.id);

		// Check if user already reacted with this type
		const existingReaction = await db.query.reactions.findFirst({
			where: and(
				eq(reactions.userId, user.id),
				eq(reactions.sharedItemId, sharedItemId),
				eq(reactions.reactionType, reactionType)
			)
		});

		if (existingReaction) {
			// Remove reaction (toggle off)
			await db.delete(reactions).where(eq(reactions.id, existingReaction.id));

			return json({
				action: 'removed',
				message: 'Reaction removed'
			});
		} else {
			// Add reaction (toggle on)
			await db.insert(reactions).values({
				id: nanoid(12),
				userId: user.id,
				sharedItemId,
				reactionType,
				createdAt: new Date()
			});

			return json(
				{
					action: 'added',
					message: 'Reaction added! ✨'
				},
				{ status: 201 }
			);
		}
	} catch (err: any) {
		console.error('Error toggling reaction:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to toggle reaction');
	}
};
