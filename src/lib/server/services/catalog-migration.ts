import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * Migrates anonymous session catalogs to a user account
 * @param sessionId - The anonymous session ID
 * @param userId - The authenticated user ID
 * @returns Object with success status, count of migrated catalogs, and optional error
 */
export async function migrateSessionCatalogs(
	sessionId: string,
	userId: string
): Promise<{ success: boolean; count: number; error?: string }> {
	try {
		// Validate inputs
		if (!sessionId || !userId) {
			return {
				success: false,
				count: 0,
				error: 'Invalid sessionId or userId'
			};
		}

		const db = getDb();

		// Find catalogs that belong to the session and don't have a userId yet
		const catalogsToMigrate = await db.query.catalogs.findMany({
			where: and(eq(catalogs.sessionId, sessionId), isNull(catalogs.userId))
		});

		if (catalogsToMigrate.length === 0) {
			// No catalogs to migrate - not an error, just nothing to do
			return {
				success: true,
				count: 0
			};
		}

		// Update all matching catalogs to set the userId
		await db
			.update(catalogs)
			.set({
				userId,
				updatedAt: new Date()
			})
			.where(and(eq(catalogs.sessionId, sessionId), isNull(catalogs.userId)));

		console.log(
			`✅ Migrated ${catalogsToMigrate.length} catalog(s) from session ${sessionId} to user ${userId}`
		);

		return {
			success: true,
			count: catalogsToMigrate.length
		};
	} catch (error: any) {
		console.error('Catalog migration error:', error);
		return {
			success: false,
			count: 0,
			error: error?.message || 'Unknown migration error'
		};
	}
}

/**
 * Gets the count of catalogs for a session
 * Useful for showing users how many catalogs they've created before signing up
 */
export async function getSessionCatalogCount(sessionId: string): Promise<number> {
	try {
		if (!sessionId) return 0;

		const db = getDb();
		const sessionCatalogs = await db.query.catalogs.findMany({
			where: and(eq(catalogs.sessionId, sessionId), isNull(catalogs.userId))
		});

		return sessionCatalogs.length;
	} catch (error) {
		console.error('Error getting session catalog count:', error);
		return 0;
	}
}
