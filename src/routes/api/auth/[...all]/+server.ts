import { auth } from '$lib/server/auth/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	return await auth.handler(request);
};

export const POST: RequestHandler = async ({ request }) => {
	return await auth.handler(request);
};

export const PUT: RequestHandler = async ({ request }) => {
	return await auth.handler(request);
};

export const DELETE: RequestHandler = async ({ request }) => {
	return await auth.handler(request);
};

export const PATCH: RequestHandler = async ({ request }) => {
	return await auth.handler(request);
};
