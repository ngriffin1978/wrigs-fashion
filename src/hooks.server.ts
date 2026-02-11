import { type Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth/config';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		// Get session from Better Auth
		// Better Auth reads from cookies automatically via headers
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session && session.user && session.session) {
			// Attach user and session to event.locals
			event.locals.user = {
				id: session.user.id,
				email: session.user.email,
				nickname: session.user.name || 'User', // Better Auth uses 'name' field
				avatarUrl: session.user.image || undefined,
				emailVerified: session.user.emailVerified || false,
				role: 'user' // Default role
			};

			event.locals.session = {
				id: session.session.id,
				userId: session.user.id,
				expiresAt: new Date(session.session.expiresAt)
			};
		}
	} catch (err) {
		// If session validation fails, just continue without user
		console.error('Session validation error:', err);
	}

	// Continue to route handler
	const response = await resolve(event);
	return response;
};
