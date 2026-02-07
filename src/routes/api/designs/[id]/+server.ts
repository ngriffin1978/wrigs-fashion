import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { designs, sharedItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/designs/[id] - Get single design
export const GET: RequestHandler = async ({ locals, params }) => {
	const user = requireAuth(locals);

	const db = getDb();
	const design = await db.query.designs.findFirst({
		where: and(
			eq(designs.id, params.id!),
			eq(designs.userId, user.id)
		)
	});

	if (!design) {
		throw error(404, 'Design not found! 🔍');
	}

	return json({ design });
};

// DELETE /api/designs/[id] - Delete design
export const DELETE: RequestHandler = async ({ locals, params }) => {
	const user = requireAuth(locals);

	const db = getDb();

	// Check ownership
	const design = await db.query.designs.findFirst({
		where: and(
			eq(designs.id, params.id!),
			eq(designs.userId, user.id)
		)
	});

	if (!design) {
		throw error(404, 'Design not found! 🔍');
	}

	// CRITICAL: Delete related shared items first to prevent orphaned references
	await db
		.delete(sharedItems)
		.where(and(eq(sharedItems.itemType, 'design'), eq(sharedItems.itemId, params.id!)));

	// Delete the design (cascade will delete doll projects)
	await db.delete(designs).where(eq(designs.id, params.id!));

	return json({
		success: true,
		message: 'Design deleted! 🗑️'
	});
};
