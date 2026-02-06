import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '$lib/server/db';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	database: drizzleAdapter(getDb(), {
		provider: 'mysql'
	}),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // V1: optional, V2: true
		minPasswordLength: 8,
		maxPasswordLength: 128
	},

	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // Update session if older than 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5 // 5 minutes
		}
	},

	advanced: {
		cookiePrefix: 'wrigs',
		useSecureCookies: env.NODE_ENV === 'production',
		crossSubDomainCookies: {
			enabled: false
		}
	},

	secret: env.AUTH_SECRET || 'dev_secret_change_in_production',

	trustedOrigins: [env.PUBLIC_APP_URL || 'http://localhost:3001']
});
