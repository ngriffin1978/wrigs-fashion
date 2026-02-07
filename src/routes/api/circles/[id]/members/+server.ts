import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { circleMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireCircleMembership, canRemoveMember } from '$lib/utils/circle-permissions';

/**
 * GET /api/circles/[id]/members
 * List all members of a circle
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user has access to this circle
		await requireCircleMembership(circleId, user.id);

		// Fetch members
		const members = await db.query.circleMembers.findMany({
			where: eq(circleMembers.circleId, circleId),
			with: {
				user: true,
				circle: true
			},
			orderBy: (circleMembers, { desc }) => [desc(circleMembers.joinedAt)]
		});

		return json({
			members,
			total: members.length
		});
	} catch (err: any) {
		console.error('Error fetching members:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to load members');
	}
};

/**
 * DELETE /api/circles/[id]/members
 * Remove a member from a circle
 * Body: { userId: string }
 * Users can remove themselves OR owner can remove anyone
 */
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		const body = await request.json();
		const { userId: targetUserId } = body;

		// Validate target user ID
		if (!targetUserId || typeof targetUserId !== 'string') {
			throw error(400, 'User ID is required');
		}

		// Verify requester has access to this circle
		await requireCircleMembership(circleId, user.id);

		// Check if removal is allowed
		const allowed = await canRemoveMember(circleId, user.id, targetUserId);

		if (!allowed) {
			throw error(403, 'You do not have permission to remove this member');
		}

		// Find membership to remove
		const membership = await db.query.circleMembers.findFirst({
			where: and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, targetUserId))
		});

		if (!membership) {
			throw error(404, 'Member not found in this circle');
		}

		// Prevent owner from removing themselves via this endpoint
		// Owner must delete the circle instead
		if (membership.role === 'owner' && targetUserId === user.id) {
			throw error(400, 'Circle owners cannot leave. Delete the circle instead.');
		}

		// Remove member
		await db
			.delete(circleMembers)
			.where(
				and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, targetUserId))
			);

		const message =
			targetUserId === user.id ? 'You left the circle' : 'Member removed from circle';

		return json({
			success: true,
			message
		});
	} catch (err: any) {
		console.error('Error removing member:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to remove member');
	}
};
