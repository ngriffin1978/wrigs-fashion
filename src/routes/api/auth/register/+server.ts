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
		if (!signInData.user) {
			console.error('Better Auth signin succeeded but no user');
			throw error(500, 'Account created but login failed. Please try logging in! 🔑');
		}

		// Check for session in response OR cookie header
		let sessionCookie = signInResult.headers.get('set-cookie');
		const hasSession = signInData.session || sessionCookie;
		
		if (!hasSession) {
			console.error('Better Auth signin succeeded but no session');
			console.log('signInData:', JSON.stringify(signInData));
			console.log('sessionCookie:', sessionCookie);
			throw error(500, 'Account created but login failed. Please try logging in! 🔑');
		}

		// Set session cookies from Better Auth response
		// Better Auth may set multiple cookies
		const setCookies = signInResult.headers.get('set-cookie');
		if (setCookies) {
			// Use getSetCookie() if available (Node 18+), otherwise split carefully.
			// Cookie values can contain '=' (e.g. base64 session data), so we must
			// split on the FIRST '=' only, not use split('=').length === 2.
			const headers = signInResult.headers as Headers & { getSetCookie?: () => string[] };
			const cookieStrings: string[] = typeof headers.getSetCookie === 'function'
				? headers.getSetCookie()
				: setCookies.split(/,\s*(?=[a-zA-Z_-]+=)/);

			for (const cookieString of cookieStrings) {
				const nameValuePart = cookieString.split(';')[0];
				const equalsIndex = nameValuePart.indexOf('=');
				if (equalsIndex > 0) {
					const cookieName = nameValuePart.substring(0, equalsIndex).trim();
					const cookieValue = decodeURIComponent(nameValuePart.substring(equalsIndex + 1).trim());

					cookies.set(cookieName, cookieValue, {
						path: '/',
						httpOnly: true,
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						maxAge: 60 * 60 * 24 * 30 // 30 days
					});
				}
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
