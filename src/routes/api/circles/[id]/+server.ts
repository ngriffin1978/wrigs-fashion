import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { circles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireCircleMembership, requireCircleOwnership } from '$lib/utils/circle-permissions';

/**
 * GET /api/circles/[id]
 * Get circle details with members and shared items
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user has access to this circle
		await requireCircleMembership(circleId, user.id);

		// Fetch circle with all relations
		const circle = await db.query.circles.findFirst({
			where: eq(circles.id, circleId),
			with: {
				members: {
					with: {
						user: true
					}
				},
				owner: true,
				sharedItems: {
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
					orderBy: (sharedItems, { desc }) => [desc(sharedItems.createdAt)]
				}
			}
		});

		if (!circle) {
			throw error(404, 'Circle not found');
		}

		// Add metadata
		const circleWithMeta = {
			...circle,
			isOwner: circle.ownerId === user.id,
			memberCount: circle.members.length,
			sharedItemsCount: circle.sharedItems.length
		};

		return json({ circle: circleWithMeta });
	} catch (err: any) {
		console.error('Error fetching circle:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to load circle');
	}
};

/**
 * PATCH /api/circles/[id]
 * Update circle name (owner only)
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user is the owner
		await requireCircleOwnership(circleId, user.id);

		const body = await request.json();
		const { name } = body;

		// Validate name
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			throw error(400, 'Circle name is required');
		}

		if (name.trim().length > 100) {
			throw error(400, 'Circle name must be 100 characters or less');
		}

		// Update circle
		await db
			.update(circles)
			.set({ name: name.trim() })
			.where(eq(circles.id, circleId));

		// Fetch updated circle
		const updatedCircle = await db.query.circles.findFirst({
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

		return json({
			circle: updatedCircle,
			message: 'Circle updated! ✨'
		});
	} catch (err: any) {
		console.error('Error updating circle:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to update circle');
	}
};

/**
 * DELETE /api/circles/[id]
 * Delete circle (owner only)
 * Cascades to delete members and shared items
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const circleId = params.id;

	try {
		// Verify user is the owner
		await requireCircleOwnership(circleId, user.id);

		// Delete circle (cascade deletes members and shared items)
		await db.delete(circles).where(eq(circles.id, circleId));

		return json({
			success: true,
			message: 'Circle deleted'
		});
	} catch (err: any) {
		console.error('Error deleting circle:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to delete circle');
	}
};
