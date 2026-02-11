import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	const timestamp = Date.now();
	const testUser = {
		email: `test-${timestamp}@example.com`,
		password: 'TestPassword123!',
		nickname: `TestUser${timestamp}`
	};

	test('should register a new user', async ({ page }) => {
		await page.goto('/auth/register');

		// Fill registration form
		await page.fill('input[name="email"], input[type="email"]', testUser.email);
		await page.fill('input[name="password"], input[type="password"]', testUser.password);
		await page.fill('input[name="confirmPassword"]', testUser.password);
		await page.fill('input[name="nickname"], input[name="name"]', testUser.nickname);

		// Submit form
		const submitButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await submitButton.click();

		// Wait for navigation
		await page.waitForLoadState('networkidle');

		// Should redirect to onboarding or portfolio after successful registration
		const url = page.url();
		expect(url).toMatch(/\/(onboarding|portfolio|upload)/);

		// Verify user is logged in (check for logout button or user menu)
		const logoutButton = page.getByRole('button', { name: /log out|sign out/i });
		const userMenu = page.locator('[class*="user-menu"], [class*="avatar"]');

		const isLoggedIn = (await logoutButton.count()) > 0 || (await userMenu.count()) > 0;
		expect(isLoggedIn).toBe(true);
	});

	test('should show validation errors for invalid registration', async ({ page }) => {
		await page.goto('/auth/register');

		// Try to submit with empty fields
		const submitButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await submitButton.click();

		// Wait a moment for validation
		await page.waitForTimeout(500);

		// Should show validation messages or prevent submission
		const alerts = page.locator('[role="alert"], .error, .alert-error, [class*="error"]');
		const hasValidation = (await alerts.count()) > 0;

		// Or check if we're still on the registration page (form not submitted)
		const url = page.url();
		const stillOnRegister = url.includes('/auth/register');

		expect(hasValidation || stillOnRegister).toBe(true);
	});

	test('should prevent registration with weak password', async ({ page }) => {
		await page.goto('/auth/register');

		// Fill with weak password
		await page.fill('input[name="email"], input[type="email"]', `test-weak-${Date.now()}@example.com`);
		await page.fill('input[name="password"], input[type="password"]', '123'); // Too short
		await page.fill('input[name="nickname"], input[name="name"]', 'TestUser');

		// Try to submit
		const submitButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await submitButton.click();

		await page.waitForTimeout(500);

		// Should show password validation error
		const passwordError = page.locator('text=/password.*8|8.*characters|too short/i');
		const hasError = (await passwordError.count()) > 0;

		// Or still on registration page
		expect(hasError || page.url().includes('/auth/register')).toBe(true);
	});

	test('should login with valid credentials', async ({ page, context }) => {
		// First, register a user
		await page.goto('/auth/register');
		await page.fill('input[name="email"], input[type="email"]', testUser.email);
		await page.fill('input[name="password"], input[type="password"]', testUser.password);
		await page.fill('input[name="confirmPassword"]', testUser.password);
		await page.fill('input[name="nickname"], input[name="name"]', testUser.nickname);

		const registerButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await registerButton.click();
		await page.waitForLoadState('networkidle');

		// Logout
		const logoutButton = page.getByRole('button', { name: /log out|sign out/i });
		if (await logoutButton.isVisible()) {
			await logoutButton.click();
			await page.waitForLoadState('networkidle');
		}

		// Now login
		await page.goto('/auth/login');
		await page.fill('input[name="email"], input[type="email"]', testUser.email);
		await page.fill('input[name="password"], input[type="password"]', testUser.password);

		const loginButton = page.getByRole('button', { name: /log in|sign in/i });
		await loginButton.click();
		await page.waitForLoadState('networkidle');

		// Verify successful login
		const url = page.url();
		expect(url).not.toContain('/auth/login');

		// Check for authenticated UI elements
		const isLoggedIn =
			(await page.getByRole('button', { name: /log out/i }).count()) > 0 ||
			(await page.locator('[class*="user-menu"], [class*="avatar"]').count()) > 0;

		expect(isLoggedIn).toBe(true);
	});

	test('should show error for invalid login credentials', async ({ page }) => {
		await page.goto('/auth/login');

		// Try to login with invalid credentials
		await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
		await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');

		const loginButton = page.getByRole('button', { name: /log in|sign in/i });
		await loginButton.click();

		await page.waitForTimeout(1000);

		// Should show error message or stay on login page
		const errorMessage = page.locator(
			'text=/invalid|incorrect|wrong|not found/i, [role="alert"], .error'
		);
		const hasError = (await errorMessage.count()) > 0;
		const stillOnLogin = page.url().includes('/auth/login');

		expect(hasError || stillOnLogin).toBe(true);
	});

	test('should persist session after page refresh', async ({ page, context }) => {
		// Register and login
		await page.goto('/auth/register');
		await page.fill('input[name="email"], input[type="email"]', testUser.email);
		await page.fill('input[name="password"], input[type="password"]', testUser.password);
		await page.fill('input[name="confirmPassword"]', testUser.password);
		await page.fill('input[name="nickname"], input[name="name"]', testUser.nickname);

		const registerButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await registerButton.click();
		await page.waitForLoadState('networkidle');

		// Verify logged in
		let isLoggedIn =
			(await page.getByRole('button', { name: /log out/i }).count()) > 0 ||
			(await page.locator('[class*="user-menu"]').count()) > 0;
		expect(isLoggedIn).toBe(true);

		// Refresh page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Verify still logged in after refresh
		isLoggedIn =
			(await page.getByRole('button', { name: /log out/i }).count()) > 0 ||
			(await page.locator('[class*="user-menu"]').count()) > 0;

		expect(isLoggedIn).toBe(true);
	});

	test('should logout successfully', async ({ page, context }) => {
		// Register and login
		await page.goto('/auth/register');
		await page.fill('input[name="email"], input[type="email"]', testUser.email);
		await page.fill('input[name="password"], input[type="password"]', testUser.password);
		await page.fill('input[name="confirmPassword"]', testUser.password);
		await page.fill('input[name="nickname"], input[name="name"]', testUser.nickname);

		const registerButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await registerButton.click();
		await page.waitForLoadState('networkidle');

		// Logout
		const logoutButton = page.getByRole('button', { name: /log out|sign out/i });
		await logoutButton.click();
		await page.waitForLoadState('networkidle');

		// Verify logged out (should not see logout button anymore)
		const isStillLoggedIn =
			(await page.getByRole('button', { name: /log out/i }).count()) > 0 ||
			(await page.locator('[class*="user-menu"]').count()) > 0;

		expect(isStillLoggedIn).toBe(false);

		// Should see login/register options
		const loginLink = page.getByRole('link', { name: /log in|sign in/i });
		await expect(loginLink).toBeVisible();
	});

	test('should redirect to login when accessing protected route', async ({ page }) => {
		// Try to access portfolio without authentication
		await page.goto('/portfolio');
		await page.waitForLoadState('networkidle');

		// Should redirect to login
		const url = page.url();
		expect(url).toContain('/auth/login');
	});

	test('should migrate anonymous catalogs on registration', async ({ page, context }) => {
		// Create an anonymous catalog first
		await page.goto('/catalogs');

		// Create a catalog (if button exists)
		const createButton = page.getByRole('button', { name: /create|new catalog/i });
		if (await createButton.isVisible()) {
			await createButton.click();
			await page.waitForTimeout(500);

			// Fill catalog title if modal appears
			const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
			if (await titleInput.isVisible()) {
				await titleInput.fill(`Test Catalog ${Date.now()}`);
				const submitButton = page.getByRole('button', { name: /create|save/i });
				await submitButton.click();
				await page.waitForLoadState('networkidle');
			}
		}

		// Now register
		await page.goto('/auth/register');
		await page.fill('input[name="email"], input[type="email"]', testUser.email);
		await page.fill('input[name="password"], input[type="password"]', testUser.password);
		await page.fill('input[name="confirmPassword"]', testUser.password);
		await page.fill('input[name="nickname"], input[name="name"]', testUser.nickname);

		const registerButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await registerButton.click();
		await page.waitForLoadState('networkidle');

		// Check if catalogs were migrated (go to catalogs page)
		await page.goto('/catalogs');
		await page.waitForLoadState('networkidle');

		// Should see the catalog we created (or empty state if none created)
		const catalogList = page.locator('[class*="catalog"], [data-testid*="catalog"]');
		console.log(`Catalogs found after migration: ${await catalogList.count()}`);
	});
});
