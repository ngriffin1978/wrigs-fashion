import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { circles, circleMembers } from '$lib/server/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { generateUniqueInviteCode } from '$lib/utils/invite-codes';

/**
 * GET /api/circles
 * List all circles the user is part of (owned or member)
 */
export const GET: RequestHandler = async ({ locals }) => {
	const user = requireAuth(locals);
	const db = getDb();

	try {
		// Get circles where user is owner
		const ownedCircles = await db.query.circles.findMany({
			where: eq(circles.ownerId, user.id),
			with: {
				members: {
					with: {
						user: true
					}
				},
				owner: true
			}
		});

		// Get circles where user is a member
		const memberships = await db.query.circleMembers.findMany({
			where: eq(circleMembers.userId, user.id),
			with: {
				circle: {
					with: {
						members: {
							with: {
								user: true
							}
						},
						owner: true
					}
				}
			}
		});

		// Combine and deduplicate (user might be owner and member)
		const memberCircles = memberships.map((m) => m.circle);
		const allCircles = [...ownedCircles];

		// Add member circles that aren't already in owned circles
		for (const memberCircle of memberCircles) {
			if (!allCircles.some((c) => c.id === memberCircle.id)) {
				allCircles.push(memberCircle);
			}
		}

		// Sort by creation date (newest first)
		allCircles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		// Add metadata about user's role and member count
		const circlesWithMeta = allCircles.map((circle) => ({
			...circle,
			isOwner: circle.ownerId === user.id,
			memberCount: circle.members.length
		}));

		return json({
			circles: circlesWithMeta,
			total: circlesWithMeta.length
		});
	} catch (err) {
		console.error('Error fetching circles:', err);
		throw error(500, 'Failed to load circles');
	}
};

/**
 * POST /api/circles
 * Create a new circle and auto-join the creator as owner
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();

	try {
		const body = await request.json();
		const { name } = body;

		// Validate name
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			throw error(400, 'Circle name is required');
		}

		if (name.trim().length > 100) {
			throw error(400, 'Circle name must be 100 characters or less');
		}

		// Generate unique invite code
		const inviteCode = await generateUniqueInviteCode();
		const circleId = nanoid(12);

		// Create circle
		await db.insert(circles).values({
			id: circleId,
			ownerId: user.id,
			name: name.trim(),
			inviteCode,
			createdAt: new Date()
		});

		// Auto-join owner as member with 'owner' role
		await db.insert(circleMembers).values({
			id: nanoid(12),
			circleId,
			userId: user.id,
			role: 'owner',
			joinedAt: new Date()
		});

		// Fetch created circle with relations
		const newCircle = await db.query.circles.findFirst({
			where: eq(circles.id, circleId),
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
				circle: newCircle,
				message: 'Circle created! Share your invite code to add friends. ✨'
			},
			{ status: 201 }
		);
	} catch (err: any) {
		console.error('Error creating circle:', err);

		// Re-throw known errors
		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to create circle');
	}
};
