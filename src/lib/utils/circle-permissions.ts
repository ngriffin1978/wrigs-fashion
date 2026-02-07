import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { circles, circleMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Check if user is the owner of a circle
 *
 * @param circleId - Circle ID to check
 * @param userId - User ID to verify
 * @returns Promise<boolean> - True if user is the owner
 */
export async function isCircleOwner(circleId: string, userId: string): Promise<boolean> {
	const db = getDb();

	const circle = await db.query.circles.findFirst({
		where: eq(circles.id, circleId)
	});

	return circle?.ownerId === userId;
}

/**
 * Require that user is a member of the circle (owner or member)
 * Throws 403 error if user is not a member
 * Throws 404 error if circle doesn't exist
 *
 * @param circleId - Circle ID to check
 * @param userId - User ID to verify
 * @throws Error with 403 status if not a member
 * @throws Error with 404 status if circle not found
 */
export async function requireCircleMembership(circleId: string, userId: string): Promise<void> {
	const db = getDb();

	// Check if circle exists
	const circle = await db.query.circles.findFirst({
		where: eq(circles.id, circleId)
	});

	if (!circle) {
		throw error(404, 'Circle not found');
	}

	// Owner always has access
	if (circle.ownerId === userId) {
		return;
	}

	// Check if user is a member
	const membership = await db.query.circleMembers.findFirst({
		where: and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, userId))
	});

	if (!membership) {
		throw error(403, 'You are not a member of this circle');
	}
}

/**
 * Require that user is the owner of the circle
 * Throws 403 error if user is not the owner
 * Throws 404 error if circle doesn't exist
 *
 * @param circleId - Circle ID to check
 * @param userId - User ID to verify
 * @throws Error with 403 status if not the owner
 * @throws Error with 404 status if circle not found
 */
export async function requireCircleOwnership(circleId: string, userId: string): Promise<void> {
	const db = getDb();

	const circle = await db.query.circles.findFirst({
		where: eq(circles.id, circleId)
	});

	if (!circle) {
		throw error(404, 'Circle not found');
	}

	if (circle.ownerId !== userId) {
		throw error(403, 'Only the circle owner can perform this action');
	}
}

/**
 * Check if a user can remove a specific member from a circle
 * Users can remove themselves (leave) OR owner can remove anyone
 *
 * @param circleId - Circle ID
 * @param requesterId - User requesting the removal
 * @param targetUserId - User to be removed
 * @returns Promise<boolean> - True if removal is allowed
 */
export async function canRemoveMember(
	circleId: string,
	requesterId: string,
	targetUserId: string
): Promise<boolean> {
	// Users can always remove themselves
	if (requesterId === targetUserId) {
		return true;
	}

	// Only owner can remove other members
	return await isCircleOwner(circleId, requesterId);
}
