import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth/config';
import { validateRegistration } from '$lib/server/auth/validation';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

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

		// TODO: Trigger catalog migration (implement in Phase 4)
		// const sessionId = getSessionId(cookies);
		// await migrateSessionCatalogs(sessionId, result.user.id);

		return json({
			success: true,
			userId: result.user.id,
			message: 'Account created successfully! 🎉'
		}, { status: 201 });

	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		console.error('Registration error:', err);
		throw error(500, 'Something went wrong! Please try again 😅');
	}
};
