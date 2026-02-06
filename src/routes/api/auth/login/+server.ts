import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';
import { validateEmail } from '$lib/server/auth/validation';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		// Validate inputs
		if (!email || !password) {
			throw error(400, 'Email and password are required! 📧🔒');
		}

		const emailValidation = validateEmail(email);
		if (!emailValidation.valid) {
			throw error(400, emailValidation.error!);
		}

		// Attempt login with Better Auth
		const session = await auth.api.signInEmail({
			body: {
				email: email.toLowerCase(),
				password
			}
		});

		if (!session) {
			throw error(401, "Hmm, that password doesn't match. Try again! 🔑");
		}

		// Set session cookie
		const sessionCookie = auth.createSessionCookie(session.token);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});

		// TODO: Trigger catalog migration (implement in Phase 4)
		// const sessionId = getSessionId(cookies);
		// const migratedCount = await migrateSessionCatalogs(sessionId, session.user.id);

		return json({
			success: true,
			user: {
				id: session.user.id,
				email: session.user.email,
				nickname: session.user.name
			},
			message: 'Welcome back! 🎉'
		});

	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		console.error('Login error:', err);
		throw error(500, 'Something went wrong! Please try again 😅');
	}
};
