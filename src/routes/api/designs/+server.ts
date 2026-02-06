import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { designs } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/designs - List user's designs
export const GET: RequestHandler = async ({ locals }) => {
	const user = requireAuth(locals);

	const db = getDb();
	const userDesigns = await db.query.designs.findMany({
		where: eq(designs.userId, user.id),
		orderBy: [desc(designs.createdAt)]
	});

	return json({ designs: userDesigns });
};

// POST /api/designs - Create new design
export const POST: RequestHandler = async ({ locals, request }) => {
	const user = requireAuth(locals);

	try {
		const { title, originalImageUrl, cleanedImageUrl, coloredOverlayUrl } = await request.json();

		if (!title) {
			throw error(400, 'Design title is required! 🎨');
		}

		const db = getDb();
		const newDesign = await db.insert(designs).values({
			id: nanoid(),
			userId: user.id,
			title,
			originalImageUrl: originalImageUrl || null,
			cleanedImageUrl: cleanedImageUrl || null,
			coloredOverlayUrl: coloredOverlayUrl || null
		});

		// Get the created design
		const createdDesign = await db.query.designs.findFirst({
			where: eq(designs.id, newDesign.insertId as unknown as string)
		});

		return json({
			success: true,
			design: createdDesign,
			message: 'Design saved to your portfolio! 🎉'
		}, { status: 201 });

	} catch (err: any) {
		if (err.status) throw err;
		console.error('Create design error:', err);
		throw error(500, 'Failed to save design. Try again! 😅');
	}
};
