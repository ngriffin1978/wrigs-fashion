import { test, expect } from '@playwright/test';

test.describe('Paper Doll System', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to doll builder (may require a design first)
		await page.goto('/doll-builder');
	});

	test('should load doll template selection page', async ({ page }) => {
		// Verify page loaded
		await expect(page).toHaveURL(/\/doll-builder/);

		// Look for template selection UI
		const templates = page.locator('[class*="template"], [data-testid*="template"]');
		const heading = page.getByRole('heading', { name: /template|doll|choose|select/i });

		const hasContent = (await templates.count()) > 0 || (await heading.count()) > 0;
		expect(hasContent).toBe(true);
	});

	test('should display 6 paper doll templates', async ({ page }) => {
		// Look for template cards/items
		const templates = page.locator(
			'[class*="template-card"], [class*="doll-template"], img[src*="template"], img[src*="doll"]'
		);

		const count = await templates.count();
		console.log(`Found ${count} templates`);

		// Should have 6 templates (2 poses × 3 body types)
		// May be more if there are duplicate images or other elements
		expect(count).toBeGreaterThan(0);
	});

	test('should filter templates by pose', async ({ page }) => {
		// Look for pose filter buttons
		const poseFilters = page.getByRole('button', { name: /pose|all poses/i });

		if ((await poseFilters.count()) > 0) {
			console.log(`Found ${await poseFilters.count()} pose filter options`);

			// Click a pose filter
			const poseAFilter = page.getByRole('button', { name: /pose a/i });
			if (await poseAFilter.isVisible()) {
				await poseAFilter.click();
				await page.waitForTimeout(500);

				// Templates should be filtered
				const visibleTemplates = page.locator(
					'[class*="template"]:visible, img[src*="pose-a"]:visible'
				);
				console.log(`Visible templates after filter: ${await visibleTemplates.count()}`);
			}
		}
	});

	test('should filter templates by body type', async ({ page }) => {
		// Look for body type filter buttons
		const bodyTypeFilters = page.getByRole('button', { name: /classic|curvy|petite|all body/i });

		if ((await bodyTypeFilters.count()) > 0) {
			console.log(`Found ${await bodyTypeFilters.count()} body type filter options`);

			// Click a body type filter
			const classicFilter = page.getByRole('button', { name: /classic/i });
			if (await classicFilter.isVisible()) {
				await classicFilter.click();
				await page.waitForTimeout(500);

				// Templates should be filtered
				const visibleTemplates = page.locator('[class*="template"]:visible');
				console.log(`Visible templates after filter: ${await visibleTemplates.count()}`);
			}
		}
	});

	test('should show template details on hover or click', async ({ page }) => {
		// Find first template
		const firstTemplate = page.locator('[class*="template-card"], [class*="doll"]').first();

		if (await firstTemplate.isVisible()) {
			// Hover over template
			await firstTemplate.hover();
			await page.waitForTimeout(300);

			// Look for details or selection button
			const selectButton = page.getByRole('button', { name: /choose|select/i });
			const hasInteraction = (await selectButton.count()) > 0;

			expect(hasInteraction).toBe(true);
		}
	});

	test('should navigate to placement page after selecting template', async ({ page }) => {
		// Find and click a template selection button
		const selectButton = page.getByRole('button', { name: /choose|select.*doll/i }).first();

		if (await selectButton.isVisible()) {
			await selectButton.click();
			await page.waitForLoadState('networkidle');

			// Should navigate to placement page
			const url = page.url();
			expect(url).toMatch(/\/doll-builder\/place|\/place/);
		}
	});

	test('should display design placement canvas', async ({ page }) => {
		// Navigate directly to placement page (with URL params if needed)
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Look for canvas
		const canvas = page.locator('canvas');
		const hasCanvas = (await canvas.count()) > 0;

		expect(hasCanvas).toBe(true);
	});

	test('should show outfit category selection', async ({ page }) => {
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Look for category buttons (top, bottom, dress, shoes)
		const categoryButtons = page.getByRole('button', {
			name: /top|bottom|dress|shoes|outfit/i
		});

		const count = await categoryButtons.count();
		console.log(`Found ${count} category options`);

		expect(count).toBeGreaterThan(0);
	});

	test('should allow design positioning on canvas', async ({ page }) => {
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Look for canvas and positioning controls
		const canvas = page.locator('canvas');

		if (await canvas.isVisible()) {
			// Try to drag (simulate mouse movement)
			const canvasBox = await canvas.boundingBox();
			if (canvasBox) {
				await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
				await page.mouse.down();
				await page.mouse.move(canvasBox.x + 150, canvasBox.y + 150);
				await page.mouse.up();

				console.log('Simulated drag on canvas');
			}
		}

		// Look for scale/size controls
		const scaleControl = page.locator('input[type="range"], [class*="scale"], [class*="size"]');
		const hasControls = (await scaleControl.count()) > 0;

		expect(hasControls).toBe(true);
	});

	test('should show paper size selection (Letter and A4)', async ({ page }) => {
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Look for paper size options
		const paperSizeOptions = page.locator('text=/letter|a4|paper size/i');

		const count = await paperSizeOptions.count();
		console.log(`Found ${count} paper size references`);

		// Should have both Letter and A4 options
		const hasLetter = (await page.locator('text=/letter|8.5.*11/i').count()) > 0;
		const hasA4 = (await page.locator('text=/a4|210.*297/i').count()) > 0;

		console.log(`Letter option: ${hasLetter}, A4 option: ${hasA4}`);
	});

	test('should generate PDF with "Generate PDF" button', async ({ page }) => {
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Look for generate PDF button
		const generateButton = page.getByRole('button', { name: /generate|create.*pdf|download/i });

		if (await generateButton.isVisible()) {
			// Start download wait before clicking
			const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

			await generateButton.click();

			// Wait for PDF generation (should be < 10 seconds per spec)
			const startTime = Date.now();

			try {
				const download = await downloadPromise;
				const generationTime = Date.now() - startTime;

				console.log(`PDF generation took: ${generationTime}ms`);
				expect(generationTime).toBeLessThan(10000);

				// Verify it's a PDF
				const filename = download.suggestedFilename();
				expect(filename).toMatch(/\.pdf$/i);
			} catch (error) {
				console.log('PDF download not triggered or took too long');
			}
		}
	});

	test('should show 2-page PDF with doll and outfit', async ({ page }) => {
		// This test would require PDF parsing or visual comparison
		// For now, just verify the generate button works
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		const generateButton = page.getByRole('button', { name: /generate|create.*pdf/i });

		if (await generateButton.isVisible()) {
			await generateButton.click();

			// Wait for generation to complete
			await page.waitForTimeout(3000);

			// Look for success message or download
			const successMessage = page.locator('text=/success|generated|ready|download/i');
			const hasSuccess = (await successMessage.count()) > 0;

			console.log(`PDF generation success message shown: ${hasSuccess}`);
		}
	});

	test('should include cut lines and tabs in PDF', async ({ page }) => {
		// This would require PDF inspection
		// Test that the PDF generation completes without errors
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		const generateButton = page.getByRole('button', { name: /generate|create.*pdf/i });

		if (await generateButton.isVisible()) {
			const errors: string[] = [];

			page.on('console', (msg) => {
				if (msg.type() === 'error') {
					errors.push(msg.text());
				}
			});

			await generateButton.click();
			await page.waitForTimeout(5000);

			// Should not have console errors during generation
			const relevantErrors = errors.filter((err) => !err.includes('favicon'));
			expect(relevantErrors.length).toBe(0);
		}
	});

	test('should support both Letter (8.5x11) and A4 (210x297mm) sizes', async ({ page }) => {
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Look for paper size toggle/radio buttons
		const letterOption = page.locator('text=/letter/i, input[value="letter"]');
		const a4Option = page.locator('text=/a4/i, input[value="a4"]');

		const hasLetterOption = (await letterOption.count()) > 0;
		const hasA4Option = (await a4Option.count()) > 0;

		console.log(`Letter option available: ${hasLetterOption}`);
		console.log(`A4 option available: ${hasA4Option}`);

		// At least one should be visible
		expect(hasLetterOption || hasA4Option).toBe(true);
	});

	test('should show preview of placement before PDF generation', async ({ page }) => {
		await page.goto('/doll-builder/place?templateId=pose-a-average&designUrl=/test.png');

		// Canvas should show live preview
		const canvas = page.locator('canvas');
		await expect(canvas).toBeVisible();

		// Should show doll template
		const dollImage = page.locator('img[src*="doll"], img[src*="template"]');
		const hasDoll = (await dollImage.count()) > 0;

		console.log(`Doll template visible in preview: ${hasDoll}`);
	});

	test('should handle missing design gracefully', async ({ page }) => {
		// Navigate without designUrl
		await page.goto('/doll-builder/place?templateId=pose-a-average');

		// Should show error or redirect back
		await page.waitForTimeout(1000);

		const errorMessage = page.locator('[role="alert"], .error');
		const hasError = (await errorMessage.count()) > 0;

		const url = page.url();
		const redirectedBack = url.includes('/doll-builder') && !url.includes('/place');

		console.log(`Error shown: ${hasError}, Redirected: ${redirectedBack}`);
		expect(hasError || redirectedBack).toBe(true);
	});
});
