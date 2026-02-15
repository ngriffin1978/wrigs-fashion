import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, nickname, newPassword } = await request.json();

		// Validate inputs
		if (!email && !nickname) {
			throw error(400, "We need your email or nickname to find your account! 🔍");
		}

		if (!newPassword || newPassword.length < 8) {
			throw error(400, "Your new password needs at least 8 characters! 🔐");
		}

		const db = getDb();

		// Find user by email OR nickname
		let user = null;
		if (email) {
			user = await db.query.users.findFirst({
				where: eq(users.email, email.toLowerCase())
			});
		}

		// If not found by email, try nickname
		if (!user && nickname) {
			user = await db.query.users.findFirst({
				where: eq(users.name, nickname)
			});
		}

		if (!user) {
			throw error(404, "We couldn't find an account with that email or nickname. Check and try again! 🤔");
		}

		// Verify: if they provided both, make sure they match
		if (email && nickname && user.name.toLowerCase() !== nickname.toLowerCase()) {
			throw error(400, "The nickname doesn't match our records. Try again! 📝");
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update password
		await db.update(users)
			.set({ password: hashedPassword })
			.where(eq(users.id, user.id));

		return json({
			success: true,
			message: "Your password has been reset! You can now log in with your new password. 🎉"
		});

	} catch (err: any) {
		console.error('Password reset error:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, "Something went wrong. Try again later! 😅");
	}
};
