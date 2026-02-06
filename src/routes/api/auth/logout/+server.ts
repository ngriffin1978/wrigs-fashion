import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Sign out using Better Auth
		await auth.api.signOut({
			headers: request.headers
		});

		// Clear all auth-related cookies
		const cookieName = 'wrigs.session_token';
		cookies.delete(cookieName, { path: '/' });

		return json({
			success: true,
			message: 'Logged out successfully! See you next time! 👋'
		});

	} catch (err) {
		console.error('Logout error:', err);
		// Even if there's an error, clear the cookie and return success
		// to prevent the user from being stuck
		cookies.delete('wrigs.session_token', { path: '/' });

		return json({
			success: true,
			message: 'Logged out successfully! See you next time! 👋'
		});
	}
};
