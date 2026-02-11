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

		// Use Better Auth's server API directly with asResponse flag
		const signUpResult = await auth.api.signUpEmail({
			body: {
				email: email.toLowerCase(),
				password,
				name: nickname
			},
			asResponse: true
		});

		if (!signUpResult || !signUpResult.ok) {
			const errorText = await signUpResult?.text();
			console.error('Better Auth signup failed:', errorText);
			throw error(500, 'Failed to create account. Please try again! 😅');
		}

		const signUpData = await signUpResult.json();
		if (!signUpData.user) {
			console.error('Better Auth signup succeeded but no user returned');
			throw error(500, 'Failed to create account. Please try again! 😅');
		}

		// Now sign in to create a session
		const signInResult = await auth.api.signInEmail({
			body: {
				email: email.toLowerCase(),
				password
			},
			asResponse: true
		});

		if (!signInResult || !signInResult.ok) {
			const errorText = await signInResult?.text();
			console.error('Better Auth signin after signup failed:', errorText);
			throw error(500, 'Account created but login failed. Please try logging in! 🔑');
		}

		const signInData = await signInResult.json();
		if (!signInData.user || !signInData.session) {
			console.error('Better Auth signin succeeded but no session');
			throw error(500, 'Account created but login failed. Please try logging in! 🔑');
		}

		// Set session cookie from Better Auth response
		const setCookieHeader = signInResult.headers.get('set-cookie');
		if (setCookieHeader) {
			// Better Auth sets the cookie with format: wrigs_session=token; ...
			const cookieParts = setCookieHeader.split(';')[0].split('=');
			if (cookieParts.length === 2) {
				cookies.set(cookieParts[0].trim(), cookieParts[1].trim(), {
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
		console.error('Error message:', err.message);
		console.error('Error stack:', err.stack);
		throw error(500, 'Something went wrong! Please try again 😅');
	}
};
