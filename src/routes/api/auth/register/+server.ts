import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';
import { validateRegistration } from '$lib/server/auth/validation';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { migrateSessionCatalogs } from '$lib/server/services/catalog-migration';
import { getSessionId } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password, nickname } = await request.json();

		// Validate inputs
		const validation = validateRegistration(email, password, nickname);
		if (!validation.valid) {
			throw error(400, {
				message: 'Validation failed',
				errors: validation.errors
			});
		}

		const db = getDb();

		// Check if email already exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.email, email.toLowerCase())
		});

		if (existingUser) {
			throw error(400, 'Someone already has that email. Try logging in instead! 🔐');
		}

		// Create user with Better Auth
		const result = await auth.api.signUpEmail({
			body: {
				email: email.toLowerCase(),
				password,
				name: nickname,
				image: undefined
			}
		});

		if (!result) {
			throw error(500, 'Failed to create account. Please try again! 😅');
		}

		// Create session
		const session = await auth.api.signInEmail({
			body: {
				email: email.toLowerCase(),
				password
			}
		});

		if (!session) {
			throw error(500, 'Account created but login failed. Please try logging in! 🔑');
		}

		// Set session cookie
		const sessionCookie = auth.createSessionCookie(session.token);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});

		// Migrate anonymous session catalogs to user account
		const sessionId = getSessionId(cookies);
		const migrationResult = await migrateSessionCatalogs(sessionId, result.user.id);

		// Build success message
		let message = '🎉 Account created successfully!';
		if (migrationResult.success && migrationResult.count > 0) {
			const catalogWord = migrationResult.count === 1 ? 'catalog' : 'catalogs';
			message += ` We found ${migrationResult.count} ${catalogWord} from your session! ✨`;
		}

		return json({
			success: true,
			userId: result.user.id,
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
