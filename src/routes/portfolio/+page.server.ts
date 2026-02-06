import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guards';
import { getDb } from '$lib/server/db';
import { designs } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Require authentication - redirects to login if not authenticated
	const user = requireUser(locals, url.pathname);

	const db = getDb();

	// Load user's designs from database
	const userDesigns = await db.query.designs.findMany({
		where: eq(designs.userId, user.id),
		orderBy: [desc(designs.createdAt)]
	});

	return {
		designs: userDesigns,
		user
	};
};
