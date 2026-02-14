import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Sign out using Better Auth
		await auth.api.signOut({
			headers: request.headers
		});

		// Clear both session cookies
		cookies.delete('wrigs_session', { path: '/', secure: true, sameSite: 'lax' });
		cookies.delete('__Secure-wrigs.session_token', { path: '/', secure: true, sameSite: 'lax' });

		return json({
			success: true,
			message: 'Logged out successfully! See you next time! 👋'
		});

	} catch (err) {
		console.error('Logout error:', err);
		// Even if there's an error, clear both cookies and return success
		// to prevent the user from being stuck
		cookies.delete('wrigs_session', { path: '/', secure: true, sameSite: 'lax' });
		cookies.delete('__Secure-wrigs.session_token', { path: '/', secure: true, sameSite: 'lax' });

		return json({
			success: true,
			message: 'Logged out successfully! See you next time! 👋'
		});
	}
};
