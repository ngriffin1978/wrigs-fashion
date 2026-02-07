import { nanoid } from 'nanoid';
import { getDb } from '$lib/server/db';
import { circles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Generate a unique invite code for circles
 * Format: 8 uppercase alphanumeric characters (e.g., "ABCD1234")
 * Retries up to 5 times if collision detected
 *
 * @returns Promise<string> - Unique 8-character invite code
 * @throws Error if unable to generate unique code after 5 attempts
 */
export async function generateUniqueInviteCode(): Promise<string> {
	const db = getDb();
	const maxAttempts = 5;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		// Generate 8-character code with nanoid (URL-safe)
		const code = nanoid(8).toUpperCase();

		// Check for collision in database
		const existing = await db.query.circles.findFirst({
			where: eq(circles.inviteCode, code)
		});

		if (!existing) {
			return code;
		}

		// Log collision for debugging (very rare with 8 chars = ~2.8 trillion combinations)
		console.warn(`Invite code collision detected on attempt ${attempt + 1}: ${code}`);
	}

	throw new Error('Failed to generate unique invite code after 5 attempts');
}
