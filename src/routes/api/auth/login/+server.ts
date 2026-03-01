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

		// Use Better Auth's server API directly with asResponse flag
		const signInResult = await auth.api.signInEmail({
			body: {
				email: email.toLowerCase(),
				password
			},
			asResponse: true
		});

		if (!signInResult || !signInResult.ok) {
			const errorText = await signInResult?.text();
			console.error('Better Auth signin failed:', errorText);
			throw error(401, "Hmm, that password doesn't match. Try again! 🔑");
		}

		const signInData = await signInResult.json();
		if (!signInData.user) {
			console.error('Better Auth signin succeeded but no user');
			throw error(401, "Hmm, that password doesn't match. Try again! 🔑");
		}

		// Check for session in response OR cookie header
		let sessionCookie = signInResult.headers.get('set-cookie');
		const hasSession = signInData.session || sessionCookie;

		if (!hasSession) {
			console.error('Better Auth signin succeeded but no session');
			throw error(401, "Hmm, that password doesn't match. Try again! 🔑");
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
