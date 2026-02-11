import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';
import { validateRegistration } from '$lib/server/auth/validation';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { migrateSessionCatalogs } from '$lib/server/services/catalog-migration';
import { getSessionId } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password, nickname } = await request.json();

		// Validate inputs
		const validation = validateRegistration(email, password, nickname);
		if (!validation.valid) {
			// Join all error messages into a single string
			const errorMessages = Object.values(validation.errors).filter(Boolean);
			const errorMessage = errorMessages.join(', ');
			throw error(400, `Validation failed: ${errorMessage}`);
		}

		const db = getDb();

		// Check if email already exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.email, email.toLowerCase())
		});

		if (existingUser) {
			throw error(400, 'Someone already has that email. Try logging in instead! 🔐');
		}

		// Create a proper Request for Better Auth
		const signUpRequest = new Request('http://localhost/api/auth/sign-up/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email.toLowerCase(),
				password,
				name: nickname
			})
		});

		// Call Better Auth's signUp handler
		const signUpResponse = await auth.handler(signUpRequest);
		const signUpData = await signUpResponse.json();

		if (!signUpResponse.ok || !signUpData.user) {
			console.error('Better Auth signup failed:', signUpData);
			throw error(500, signUpData.error?.message || 'Failed to create account. Please try again! 😅');
		}

		// Create a proper Request for Better Auth sign-in
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

		// Sign in the user to get a session
		const signInResponse = await auth.handler(signInRequest);
		const signInData = await signInResponse.json();

		if (!signInResponse.ok || !signInData.user) {
			console.error('Better Auth signin failed:', signInData);
			throw error(500, 'Account created but login failed. Please try logging in! 🔑');
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
					secure: process.env.NODE_ENV === 'production',
					maxAge: 60 * 60 * 24 * 30 // 30 days
				});
			}
		}

		// Migrate anonymous session catalogs to user account
		const sessionId = getSessionId(cookies);
		const migrationResult = await migrateSessionCatalogs(sessionId, signUpData.user.id);

		// Build success message
		let message = '🎉 Account created successfully!';
		if (migrationResult.success && migrationResult.count > 0) {
			const catalogWord = migrationResult.count === 1 ? 'catalog' : 'catalogs';
			message += ` We found ${migrationResult.count} ${catalogWord} from your session! ✨`;
		}

		return json({
			success: true,
			userId: signUpData.user.id,
			user: {
				id: signUpData.user.id,
				email: signUpData.user.email,
				nickname: signUpData.user.name
			},
			message,
			migratedCatalogs: migrationResult.count
		}, { status: 201 });

	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		console.error('Registration error:', err);
		throw error(500, 'Something went wrong! Please try again 😅');
	}
};
