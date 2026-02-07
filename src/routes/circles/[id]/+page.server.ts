import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guards';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
	// Require authentication
	const user = requireUser(locals);

	// Fetch circle details
	const circleResponse = await fetch(`/api/circles/${params.id}`);

	if (!circleResponse.ok) {
		if (circleResponse.status === 404) {
			throw error(404, 'Circle not found');
		}
		if (circleResponse.status === 403) {
			throw error(403, 'You do not have access to this circle');
		}
		throw error(500, 'Failed to load circle');
	}

	const circleData = await circleResponse.json();

	// Fetch shared items
	const itemsResponse = await fetch(`/api/circles/${params.id}/items`);
	let items = [];

	if (itemsResponse.ok) {
		const itemsData = await itemsResponse.json();
		items = itemsData.items || [];
	}

	return {
		circle: circleData.circle,
		items
	};
};
