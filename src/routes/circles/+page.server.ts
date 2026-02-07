import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guards';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	// Require authentication
	const user = requireUser(locals);

	// Fetch user's circles
	const response = await fetch('/api/circles');

	if (!response.ok) {
		return {
			circles: [],
			error: 'Failed to load circles'
		};
	}

	const data = await response.json();

	return {
		circles: data.circles || [],
		total: data.total || 0
	};
};
