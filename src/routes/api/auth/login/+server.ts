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

		// Create a proper Request for Better Auth
		const signInRequest = new Request('http://localhost/api/auth/sign-in/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email.toLowerCase(),
				password
			})
		});

		// Call Better Auth's signIn handler
		const signInResponse = await auth.handler(signInRequest);
		const signInData = await signInResponse.json();

		if (!signInResponse.ok || !signInData.user) {
			console.error('Better Auth signin failed:', signInData);
			throw error(401, "Hmm, that password doesn't match. Try again! 🔑");
		}

		// Set session cookie from Better Auth response
		const setCookieHeader = signInResponse.headers.get('set-cookie');
		if (setCookieHeader) {
			// Parse and set the session cookie
			const cookieMatch = setCookieHeader.match(/([^=]+)=([^;]+)/);
			if (cookieMatch) {
				cookies.set(cookieMatch[1], cookieMatch[2], {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: false, // Set to true in production
					maxAge: 60 * 60 * 24 * 30 // 30 days
				});
			}
		}

		// Migrate anonymous session catalogs to user account
		const sessionId = getSessionId(cookies);
		const migrationResult = await migrateSessionCatalogs(sessionId, signInData.user.id);

		// Build success message
		let message = '🎉 Welcome back!';
		if (migrationResult.success && migrationResult.count > 0) {
			const catalogWord = migrationResult.count === 1 ? 'catalog' : 'catalogs';
			message += ` We found ${migrationResult.count} ${catalogWord} from your session! ✨`;
		}

		return json({
			success: true,
			user: {
				id: signInData.user.id,
				email: signInData.user.email,
				nickname: signInData.user.name
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
