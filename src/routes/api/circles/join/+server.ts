import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { circles, circleMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * POST /api/circles/join
 * Join a circle using an invite code
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();

	try {
		const body = await request.json();
		let { inviteCode } = body;

		// Validate invite code
		if (!inviteCode || typeof inviteCode !== 'string') {
			throw error(400, 'Invite code is required');
		}

		// Normalize to uppercase for case-insensitive matching
		inviteCode = inviteCode.trim().toUpperCase();

		if (inviteCode.length !== 8) {
			throw error(400, 'Invalid invite code format');
		}

		// Find circle by invite code
		const circle = await db.query.circles.findFirst({
			where: eq(circles.inviteCode, inviteCode),
			with: {
				members: true,
				owner: true
			}
		});

		if (!circle) {
			throw error(404, 'Circle not found. Please check your invite code and try again.');
		}

		// Check if user is already a member
		const existingMembership = await db.query.circleMembers.findFirst({
			where: and(eq(circleMembers.circleId, circle.id), eq(circleMembers.userId, user.id))
		});

		if (existingMembership) {
			throw error(400, `You're already a member of ${circle.name}! 🎉`);
		}

		// Add user as member
		await db.insert(circleMembers).values({
			id: nanoid(12),
			circleId: circle.id,
			userId: user.id,
			role: 'member',
			joinedAt: new Date()
		});

		// Fetch updated circle
		const updatedCircle = await db.query.circles.findFirst({
			where: eq(circles.id, circle.id),
			with: {
				members: {
					with: {
						user: true
					}
				},
				owner: true
			}
		});

		return json(
			{
				circle: updatedCircle,
				message: `Welcome to ${circle.name}! 🎉`
			},
			{ status: 201 }
		);
	} catch (err: any) {
		console.error('Error joining circle:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to join circle');
	}
};
