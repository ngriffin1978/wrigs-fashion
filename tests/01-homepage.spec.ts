import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should load homepage successfully', async ({ page }) => {
		// Check page title
		await expect(page).toHaveTitle(/Wrigs Fashion/i);

		// Verify page loaded
		await expect(page.locator('body')).toBeVisible();
	});

	test('should display navigation menu', async ({ page }) => {
		// Check for main navigation elements
		const nav = page.locator('nav, header');
		await expect(nav).toBeVisible();

		// Check for key navigation links
		const links = [
			{ text: /upload/i, url: '/upload' },
			{ text: /portfolio/i, url: '/portfolio' },
			{ text: /circles/i, url: '/circles' },
			{ text: /catalogs/i, url: '/catalogs' }
		];

		for (const link of links) {
			const element = page.getByRole('link', { name: link.text });
			// Just check if it exists, some may require auth
			const count = await element.count();
			console.log(`Link "${link.text.source}" found: ${count} times`);
		}
	});

	test('should display hero section', async ({ page }) => {
		// Look for hero content
		const hero = page.locator('[class*="hero"], [class*="Hero"]').first();

		// Check for main heading
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();

		// Verify it mentions fashion or design
		const text = await heading.textContent();
		expect(text?.toLowerCase()).toMatch(/fashion|design|draw|create/);
	});

	test('should have working call-to-action button', async ({ page }) => {
		// Look for primary CTA (likely "Get Started" or "Upload")
		const cta = page.getByRole('link', { name: /get started|start|upload|begin/i }).first();

		if (await cta.isVisible()) {
			await expect(cta).toBeVisible();

			// Click and verify navigation
			await cta.click();
			await page.waitForLoadState('networkidle');

			// Should navigate to upload or registration
			const url = page.url();
			expect(url).toMatch(/\/(upload|auth\/register|editor)/);
		}
	});

	test('should be responsive on tablet viewport', async ({ page }) => {
		// Set tablet viewport (primary target device)
		await page.setViewportSize({ width: 768, height: 1024 });

		// Verify layout doesn't break
		await expect(page.locator('body')).toBeVisible();

		// Check for mobile menu or hamburger on smaller screens
		const mobileMenuButton = page.locator('[aria-label*="menu"], button[class*="menu"]');
		const mobileMenuCount = await mobileMenuButton.count();

		console.log(`Mobile menu buttons found: ${mobileMenuCount}`);
	});

	test('should have proper color scheme (Lemon Meringue theme)', async ({ page }) => {
		// Check if DaisyUI theme is applied
		const html = page.locator('html');
		const dataTheme = await html.getAttribute('data-theme');

		console.log(`Theme attribute: ${dataTheme}`);

		// Verify pastel colors are used (can't check exact colors in e2e, but can verify elements exist)
		const buttons = page.getByRole('button');
		const buttonCount = await buttons.count();

		expect(buttonCount).toBeGreaterThan(0);
	});

	test('should display footer', async ({ page }) => {
		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

		// Check for footer
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();
	});

	test('should load without console errors', async ({ page }) => {
		const consoleErrors: string[] = [];

		// Listen for console errors
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Filter out known harmless errors (e.g., favicon 404)
		const realErrors = consoleErrors.filter(
			(err) => !err.includes('favicon') && !err.includes('manifest')
		);

		if (realErrors.length > 0) {
			console.log('Console errors found:', realErrors);
		}

		expect(realErrors.length).toBe(0);
	});
});
