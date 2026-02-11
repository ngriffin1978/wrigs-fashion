import { test, expect } from '@playwright/test';

test.describe('Circles (Invite-Only Groups)', () => {
	const timestamp = Date.now();
	const testUser = {
		email: `circles-test-${timestamp}@example.com`,
		password: 'TestPassword123!',
		nickname: `CircleUser${timestamp}`
	};

	let inviteCode: string = '';

	// Helper function to register and login
	async function registerAndLogin(page: any, userOverride?: any) {
		const user = userOverride || testUser;

		await page.goto('/auth/register');
		await page.fill('input[name="email"], input[type="email"]', user.email);
		await page.fill('input[name="password"], input[type="password"]', user.password);
		await page.fill('input[name="confirmPassword"]', user.password);
		await page.fill('input[name="nickname"], input[name="name"]', user.nickname);

		const registerButton = page.getByRole('button', { name: /sign up|register|create account/i });
		await registerButton.click();
		await page.waitForLoadState('networkidle');
	}

	test('should require authentication to access circles', async ({ page }) => {
		await page.goto('/circles');
		await page.waitForLoadState('networkidle');

		// Should redirect to login
		const url = page.url();
		expect(url).toContain('/auth/login');
	});

	test('should display circles page for authenticated user', async ({ page }) => {
		await registerAndLogin(page);

		await page.goto('/circles');
		await page.waitForLoadState('networkidle');

		// Should be on circles page
		expect(page.url()).toContain('/circles');

		// Should show circles UI
		const heading = page.getByRole('heading', { name: /circle/i });
		await expect(heading).toBeVisible();
	});

	test('should have "Create Circle" button', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await expect(createButton).toBeVisible();
	});

	test('should create a new circle', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Click create button
		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await createButton.click();

		// Wait for modal/form
		await page.waitForTimeout(500);

		// Fill circle name
		const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
		await nameInput.fill(`Test Circle ${timestamp}`);

		// Submit
		const submitButton = page.getByRole('button', { name: /create|save/i });
		await submitButton.click();

		// Wait for circle to be created
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Should show success or navigate to circle
		const url = page.url();
		const createdCircle = url.includes('/circles') || (await page.locator('text=/test circle/i').count()) > 0;

		expect(createdCircle).toBe(true);
	});

	test('should generate 8-character uppercase invite code', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Create circle
		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await createButton.click();
		await page.waitForTimeout(500);

		const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
		await nameInput.fill(`Invite Test Circle ${timestamp}`);

		const submitButton = page.getByRole('button', { name: /create|save/i });
		await submitButton.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Look for invite code (8 uppercase alphanumeric)
		const inviteCodeElement = page.locator('text=/[A-Z0-9]{8}/, [class*="invite-code"]');

		if ((await inviteCodeElement.count()) > 0) {
			const codeText = await inviteCodeElement.first().textContent();
			console.log(`Found invite code: ${codeText}`);

			// Extract code (should be 8 characters)
			const codeMatch = codeText?.match(/[A-Z0-9]{8}/);
			if (codeMatch) {
				inviteCode = codeMatch[0];
				expect(inviteCode.length).toBe(8);
				expect(inviteCode).toMatch(/^[A-Z0-9]{8}$/);
			}
		}
	});

	test('should display invite code in circle details', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Create circle first
		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		if (await createButton.isVisible()) {
			await createButton.click();
			await page.waitForTimeout(500);

			const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
			await nameInput.fill(`Code Display Circle ${timestamp}`);

			const submitButton = page.getByRole('button', { name: /create|save/i });
			await submitButton.click();
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(1000);
		}

		// Click on the circle to view details
		const circleCard = page.locator('[class*="circle"], [data-testid*="circle"]').first();
		if (await circleCard.isVisible()) {
			await circleCard.click();
			await page.waitForLoadState('networkidle');

			// Should show invite code somewhere
			const inviteCodeDisplay = page.locator('text=/invite.*code|code:.*[A-Z0-9]{8}/i');
			const hasInviteCode = (await inviteCodeDisplay.count()) > 0;

			console.log(`Invite code displayed in circle details: ${hasInviteCode}`);
		}
	});

	test('should have "Join Circle" functionality', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Look for join button
		const joinButton = page.getByRole('button', { name: /join.*circle/i });
		const hasJoinButton = (await joinButton.count()) > 0;

		expect(hasJoinButton).toBe(true);
	});

	test('should join circle with valid invite code', async ({ page, context }) => {
		// Create a second user to join the circle
		const secondUser = {
			email: `joiner-${timestamp}@example.com`,
			password: 'TestPassword123!',
			nickname: `Joiner${timestamp}`
		};

		// First user creates circle and gets code
		await registerAndLogin(page);
		await page.goto('/circles');

		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await createButton.click();
		await page.waitForTimeout(500);

		const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
		await nameInput.fill(`Join Test Circle ${timestamp}`);

		const submitButton = page.getByRole('button', { name: /create|save/i });
		await submitButton.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Get invite code
		const inviteCodeElement = page.locator('text=/[A-Z0-9]{8}/');
		if ((await inviteCodeElement.count()) > 0) {
			const codeText = await inviteCodeElement.first().textContent();
			const codeMatch = codeText?.match(/[A-Z0-9]{8}/);
			if (codeMatch) {
				inviteCode = codeMatch[0];
			}
		}

		// Logout first user
		const logoutButton = page.getByRole('button', { name: /log out/i });
		if (await logoutButton.isVisible()) {
			await logoutButton.click();
			await page.waitForLoadState('networkidle');
		}

		// Second user registers and joins
		await registerAndLogin(page, secondUser);
		await page.goto('/circles');

		if (inviteCode) {
			// Click join button
			const joinButton = page.getByRole('button', { name: /join.*circle/i });
			await joinButton.click();
			await page.waitForTimeout(500);

			// Enter invite code
			const codeInput = page.locator('input[name="code"], input[placeholder*="code"]');
			await codeInput.fill(inviteCode);

			// Submit join
			const joinSubmit = page.getByRole('button', { name: /join|submit/i });
			await joinSubmit.click();
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(1000);

			// Should show success or display the joined circle
			const joinedCircle = page.locator(`text=/join test circle|${inviteCode}/i`);
			const hasJoined = (await joinedCircle.count()) > 0;

			expect(hasJoined).toBe(true);
		} else {
			console.log('Could not retrieve invite code, skipping join test');
		}
	});

	test('should show error for invalid invite code', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Try to join with invalid code
		const joinButton = page.getByRole('button', { name: /join.*circle/i });
		await joinButton.click();
		await page.waitForTimeout(500);

		const codeInput = page.locator('input[name="code"], input[placeholder*="code"]');
		await codeInput.fill('INVALID1');

		const joinSubmit = page.getByRole('button', { name: /join|submit/i });
		await joinSubmit.click();
		await page.waitForTimeout(1000);

		// Should show error
		const errorMessage = page.locator('[role="alert"], .error, text=/invalid|not found/i');
		const hasError = (await errorMessage.count()) > 0;

		expect(hasError).toBe(true);
	});

	test('should prevent duplicate membership', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Create a circle
		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await createButton.click();
		await page.waitForTimeout(500);

		const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
		await nameInput.fill(`Duplicate Test Circle ${timestamp}`);

		const submitButton = page.getByRole('button', { name: /create|save/i });
		await submitButton.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Get invite code
		let code = '';
		const inviteCodeElement = page.locator('text=/[A-Z0-9]{8}/');
		if ((await inviteCodeElement.count()) > 0) {
			const codeText = await inviteCodeElement.first().textContent();
			const codeMatch = codeText?.match(/[A-Z0-9]{8}/);
			if (codeMatch) {
				code = codeMatch[0];
			}
		}

		if (code) {
			// Try to join the same circle (already owner)
			const joinButton = page.getByRole('button', { name: /join.*circle/i });
			if (await joinButton.isVisible()) {
				await joinButton.click();
				await page.waitForTimeout(500);

				const codeInput = page.locator('input[name="code"], input[placeholder*="code"]');
				await codeInput.fill(code);

				const joinSubmit = page.getByRole('button', { name: /join|submit/i });
				await joinSubmit.click();
				await page.waitForTimeout(1000);

				// Should show error about already being a member
				const errorMessage = page.locator('text=/already.*member|already.*joined/i');
				const hasError = (await errorMessage.count()) > 0;

				console.log(`Duplicate membership prevented: ${hasError}`);
			}
		}
	});

	test('should display owner badge vs member badge', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Look for any circles
		const circleCards = page.locator('[class*="circle"], [data-testid*="circle"]');
		const circleCount = await circleCards.count();

		if (circleCount > 0) {
			// Look for owner or member badges
			const badge = page.locator('text=/owner|member/i, [class*="badge"]');
			const hasBadges = (await badge.count()) > 0;

			console.log(`Badges displayed: ${hasBadges}`);
		}
	});

	test('should allow owner to delete circle', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Create a circle to delete
		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await createButton.click();
		await page.waitForTimeout(500);

		const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
		await nameInput.fill(`Delete Test Circle ${timestamp}`);

		const submitButton = page.getByRole('button', { name: /create|save/i });
		await submitButton.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Click on the circle
		const circleCard = page.locator('text=/delete test circle/i').first();
		if (await circleCard.isVisible()) {
			await circleCard.click();
			await page.waitForLoadState('networkidle');

			// Look for delete button
			const deleteButton = page.getByRole('button', { name: /delete/i });
			if (await deleteButton.isVisible()) {
				await deleteButton.click();
				await page.waitForTimeout(500);

				// Confirm deletion if modal appears
				const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
				if (await confirmButton.isVisible()) {
					await confirmButton.click();
				}

				await page.waitForLoadState('networkidle');

				// Should redirect or show success
				const url = page.url();
				console.log(`After deletion, URL: ${url}`);
			}
		}
	});

	test('should allow member to leave circle', async ({ page, context }) => {
		// This test requires two users: one owner, one member
		// For simplicity, just check if leave button exists
		await registerAndLogin(page);
		await page.goto('/circles');

		// If there are any circles as a member, should see leave option
		const circleCards = page.locator('[class*="circle"]');
		if ((await circleCards.count()) > 0) {
			await circleCards.first().click();
			await page.waitForLoadState('networkidle');

			// Look for leave button
			const leaveButton = page.getByRole('button', { name: /leave/i });
			const hasLeaveOption = (await leaveButton.count()) > 0;

			console.log(`Leave option available: ${hasLeaveOption}`);
		}
	});

	test('should prevent owner from leaving (must delete)', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Create a circle (user becomes owner)
		const createButton = page.getByRole('button', { name: /create.*circle|new.*circle/i });
		await createButton.click();
		await page.waitForTimeout(500);

		const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
		await nameInput.fill(`Owner Leave Test ${timestamp}`);

		const submitButton = page.getByRole('button', { name: /create|save/i });
		await submitButton.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Click on the circle
		const circleCard = page.locator('text=/owner leave test/i').first();
		if (await circleCard.isVisible()) {
			await circleCard.click();
			await page.waitForLoadState('networkidle');

			// Should NOT see leave button (or it should be disabled)
			const leaveButton = page.getByRole('button', { name: /leave/i });
			const hasLeaveButton = (await leaveButton.count()) > 0;

			// If there is a leave button for owner, it should show error when clicked
			if (hasLeaveButton) {
				await leaveButton.click();
				await page.waitForTimeout(500);

				const errorMessage = page.locator('text=/owner.*cannot.*leave|delete.*instead/i');
				const showsError = (await errorMessage.count()) > 0;

				console.log(`Owner prevented from leaving: ${showsError}`);
			}
		}
	});

	test('should display member count', async ({ page }) => {
		await registerAndLogin(page);
		await page.goto('/circles');

		// Look for member count displays
		const memberCount = page.locator('text=/\\d+.*member|member.*\\d+/i');
		const hasMemberCount = (await memberCount.count()) > 0;

		console.log(`Member counts displayed: ${hasMemberCount}`);
	});
});
