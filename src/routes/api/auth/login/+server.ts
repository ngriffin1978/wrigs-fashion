import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';
import { validateEmail } from '$lib/server/auth/validation';
import { migrateSessionCatalogs } from '$lib/server/services/catalog-migration';
import { getSessionId } from '$lib/server/session';

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

		// Migrate anonymous session catalogs to user account
		const sessionId = getSessionId(cookies);
		const migrationResult = await migrateSessionCatalogs(sessionId, session.user.id);

		// Build success message
		let message = '🎉 Welcome back!';
		if (migrationResult.success && migrationResult.count > 0) {
			const catalogWord = migrationResult.count === 1 ? 'catalog' : 'catalogs';
			message += ` We found ${migrationResult.count} ${catalogWord} from your session! ✨`;
		}

		return json({
			success: true,
			user: {
				id: session.user.id,
				email: session.user.email,
				nickname: session.user.name
			},
			message,
			migratedCatalogs: migrationResult.count
		});

	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		console.error('Login error:', err);
		throw error(500, 'Something went wrong! Please try again 😅');
	}
};
