import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'mysql',
	dbCredentials: {
		url: process.env.DATABASE_URL || 'mysql://wrigs_user:password@localhost:3306/wrigs_fashion'
	}
} satisfies Config;
