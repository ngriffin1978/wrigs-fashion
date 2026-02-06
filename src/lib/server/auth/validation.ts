/**
 * Validation utilities for authentication inputs
 * Kid-friendly error messages with emojis
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
	if (!email) {
		return { valid: false, error: "We need your email to create your account! 📧" };
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { valid: false, error: "Hmm, that doesn't look like an email address 🤔" };
	}

	return { valid: true };
}

/**
 * Validate password strength
 * Kid-friendly: 8+ chars, 1 uppercase, 1 number
 */
export function validatePassword(password: string): ValidationResult {
	if (!password) {
		return { valid: false, error: "You need a password to keep your account safe! 🔒" };
	}

	if (password.length < 8) {
		return { valid: false, error: "Your password needs at least 8 characters to be strong! 💪" };
	}

	if (password.length > 128) {
		return { valid: false, error: "Whoa, that's too long! Keep it under 128 characters 😅" };
	}

	if (!/[A-Z]/.test(password)) {
		return { valid: false, error: "Add a capital letter to make it stronger! ABC" };
	}

	if (!/[0-9]/.test(password)) {
		return { valid: false, error: "Add a number to make it extra secure! 123" };
	}

	return { valid: true };
}

/**
 * Validate nickname
 */
export function validateNickname(nickname: string): ValidationResult {
	if (!nickname) {
		return { valid: false, error: "What should we call you? Pick a cool nickname! 🎨" };
	}

	if (nickname.length < 3) {
		return { valid: false, error: "Your nickname needs at least 3 letters! ✏️" };
	}

	if (nickname.length > 20) {
		return { valid: false, error: "Keep your nickname under 20 characters! 📝" };
	}

	// Allow letters, numbers, spaces, underscores, hyphens
	const nicknameRegex = /^[a-zA-Z0-9\s_-]+$/;
	if (!nicknameRegex.test(nickname)) {
		return { valid: false, error: "Use only letters, numbers, spaces, and _ or - 🔤" };
	}

	return { valid: true };
}

/**
 * Calculate password strength (1-3)
 */
export function getPasswordStrength(password: string): number {
	if (!password) return 0;

	let strength = 0;

	// Length check
	if (password.length >= 8) strength++;

	// Complexity checks
	if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
	if (/[0-9]/.test(password)) strength++;
	if (/[^A-Za-z0-9]/.test(password)) strength++; // Special chars (bonus)

	// Cap at 3
	return Math.min(strength, 3);
}

/**
 * Get password strength message
 */
export function getPasswordStrengthMessage(strength: number): string {
	switch (strength) {
		case 0:
			return '';
		case 1:
			return 'Getting there! 🌱';
		case 2:
			return 'Good password! 🌟';
		case 3:
			return 'Super secure! 🔒✨';
		default:
			return '';
	}
}

/**
 * Validate all registration inputs
 */
export function validateRegistration(email: string, password: string, nickname: string): {
	valid: boolean;
	errors: {
		email?: string;
		password?: string;
		nickname?: string;
	};
} {
	const errors: Record<string, string> = {};

	const emailResult = validateEmail(email);
	if (!emailResult.valid) {
		errors.email = emailResult.error!;
	}

	const passwordResult = validatePassword(password);
	if (!passwordResult.valid) {
		errors.password = passwordResult.error!;
	}

	const nicknameResult = validateNickname(nickname);
	if (!nicknameResult.valid) {
		errors.nickname = nicknameResult.error!;
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}
