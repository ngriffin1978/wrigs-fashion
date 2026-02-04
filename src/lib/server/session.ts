import { nanoid } from 'nanoid';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'wrigs_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export function getSessionId(cookies: Cookies): string {
	let sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) {
		sessionId = nanoid(21);
		cookies.set(SESSION_COOKIE, sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: SESSION_MAX_AGE
		});
	}
	return sessionId;
}
