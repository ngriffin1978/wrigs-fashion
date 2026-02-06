import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Require authentication - throw 401 if not authenticated
 * Use this in API endpoints
 */
export function requireAuth(locals: RequestEvent['locals']) {
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}
	return locals.user;
}

/**
 * Require user - redirect to login if not authenticated
 * Use this in page server load functions
 */
export function requireUser(locals: RequestEvent['locals'], returnUrl?: string) {
	if (!locals.user) {
		const url = returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/login';
		throw redirect(302, url);
	}
	return locals.user;
}

/**
 * Optional auth - continue regardless of authentication status
 * Returns user if authenticated, null otherwise
 */
export function optionalAuth(locals: RequestEvent['locals']) {
	return locals.user || null;
}

/**
 * Protected routes that REQUIRE authentication
 */
export const PROTECTED_ROUTES = [
	'/portfolio',
	'/circles',
	'/settings',
	'/onboarding'
];

/**
 * Public routes that should redirect if already authenticated
 */
export const PUBLIC_ONLY_ROUTES = [
	'/auth/login',
	'/auth/register'
];

/**
 * Check if a path requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path is public only (redirect if authenticated)
 */
export function isPublicOnlyRoute(pathname: string): boolean {
	return PUBLIC_ONLY_ROUTES.some(route => pathname.startsWith(route));
}
