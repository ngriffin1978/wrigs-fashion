import type { PageServerLoad } from './$types';
import { optionalAuth } from '$lib/server/auth/guards';

export const load: PageServerLoad = async ({ locals }) => {
	// Optional auth - allow exploration without login
	const user = optionalAuth(locals);

	return {
		user
	};
};
