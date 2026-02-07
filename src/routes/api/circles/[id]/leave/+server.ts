import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { circleMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireCircleMembership, isCircleOwner } from '$lib/utils/circle-permissions';

/**
 * POST /api/circles/[id]/leave
 * Leave a circle (members only)
 * Owner must delete the circle instead
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user has access to this circle
		await requireCircleMembership(circleId, user.id);

		// Prevent owner from leaving (must delete instead)
		const owner = await isCircleOwner(circleId, user.id);

		if (owner) {
			throw error(
				400,
				'Circle owners cannot leave. Delete the circle instead if you no longer want it.'
			);
		}

		// Find membership
		const membership = await db.query.circleMembers.findFirst({
			where: and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, user.id))
		});

		if (!membership) {
			throw error(404, 'You are not a member of this circle');
		}

		// Remove membership
		await db
			.delete(circleMembers)
			.where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, user.id)));

		return json({
			success: true,
			message: 'You left the circle'
		});
	} catch (err: any) {
		console.error('Error leaving circle:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to leave circle');
	}
};
