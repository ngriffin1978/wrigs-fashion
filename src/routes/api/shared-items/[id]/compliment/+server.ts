import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { compliments, sharedItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireCircleMembership } from '$lib/utils/circle-permissions';

// Valid compliment types with display text
const COMPLIMENT_TYPES = {
	so_creative: 'So creative! 🎨',
	love_colors: 'Love the colors! 🌈',
	amazing_design: 'Amazing design! ✨',
	super_cool: 'Super cool! 😎',
	beautiful_work: 'Beautiful work! 💖',
	wow_awesome: 'Wow! This is awesome! 🤩',
	great_style: 'Great style! 👗',
	so_pretty: 'This is so pretty! 🌸'
};

/**
 * POST /api/shared-items/[id]/compliment
 * Add a preset compliment to a shared item
 * Body: { complimentType: string }
 * Users can add multiple compliments (no limit)
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	const db = getDb();
	const sharedItemId = params.id;

	try {
		const body = await request.json();
		const { complimentType } = body;

		// Validate compliment type
		if (!complimentType || typeof complimentType !== 'string') {
			throw error(400, 'Compliment type is required');
		}

		if (!(complimentType in COMPLIMENT_TYPES)) {
			throw error(
				400,
				`Invalid compliment type. Must be one of: ${Object.keys(COMPLIMENT_TYPES).join(', ')}`
			);
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

		// Add compliment (no duplicate check - users can give multiple compliments)
		await db.insert(compliments).values({
			id: nanoid(12),
			userId: user.id,
			sharedItemId,
			complimentType,
			createdAt: new Date()
		});

		// Fetch the created compliment with user data
		const newCompliment = await db.query.compliments.findFirst({
			where: eq(compliments.sharedItemId, sharedItemId),
			with: {
				user: true
			},
			orderBy: (compliments, { desc }) => [desc(compliments.createdAt)]
		});

		return json(
			{
				compliment: newCompliment,
				message: 'Compliment added! ✨'
			},
			{ status: 201 }
		);
	} catch (err: any) {
		console.error('Error adding compliment:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to add compliment');
	}
};
