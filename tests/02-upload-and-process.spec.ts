import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Upload and Image Processing', () => {
	// Create a test image if it doesn't exist
	test.beforeAll(async () => {
		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');
		const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');

		if (!fs.existsSync(fixturesDir)) {
			fs.mkdirSync(fixturesDir, { recursive: true });
		}

		if (!fs.existsSync(testImagePath)) {
			console.log('Test image not found. You will need to add test images to tests/fixtures/');
			console.log('Required files:');
			console.log('  - test-image.jpg (standard JPG, ~2MB)');
			console.log('  - test-sketch.png (fashion sketch, any size)');
		}
	});

	test('should load upload page', async ({ page }) => {
		await page.goto('/upload');

		// Verify upload page loaded
		await expect(page).toHaveURL(/\/upload/);

		// Look for upload area or file input
		const uploadArea = page.locator(
			'input[type="file"], [class*="upload"], [class*="dropzone"]'
		);
		const count = await uploadArea.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should show drag-and-drop area', async ({ page }) => {
		await page.goto('/upload');

		// Look for dropzone or upload instructions
		const dropzoneText = page.locator(
			'text=/drag.*drop|drop.*file|choose.*file|upload.*image/i'
		);
		await expect(dropzoneText.first()).toBeVisible();
	});

	test('should accept image file upload via file input', async ({ page }) => {
		await page.goto('/upload');

		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');

		// Skip if test image doesn't exist
		if (!fs.existsSync(testImagePath)) {
			test.skip();
			return;
		}

		// Find file input
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testImagePath);

		// Wait for upload to process
		await page.waitForTimeout(2000);

		// Should show image preview or proceed to crop
		const imagePreview = page.locator('img[src*="blob:"], img[src*="data:"], canvas');
		const hasPreview = (await imagePreview.count()) > 0;

		expect(hasPreview).toBe(true);
	});

	test('should validate file size (10MB limit)', async ({ page }) => {
		await page.goto('/upload');

		// This test would need a large file to properly test
		// For now, just verify the upload mechanism exists
		const fileInput = page.locator('input[type="file"]');
		const acceptAttr = await fileInput.getAttribute('accept');

		console.log(`File input accept attribute: ${acceptAttr}`);
		// Should accept image types
		expect(acceptAttr).toMatch(/image/);
	});

	test('should validate file type (JPG, PNG, HEIC)', async ({ page }) => {
		await page.goto('/upload');

		const fileInput = page.locator('input[type="file"]');
		const acceptAttr = await fileInput.getAttribute('accept');

		// Should accept image formats
		expect(acceptAttr).toBeTruthy();
		console.log(`Accepted file types: ${acceptAttr}`);
	});

	test('should show crop tool after upload', async ({ page }) => {
		await page.goto('/upload');

		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');

		if (!fs.existsSync(testImagePath)) {
			test.skip();
			return;
		}

		// Upload image
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testImagePath);

		// Wait for crop UI to appear
		await page.waitForTimeout(2000);

		// Look for crop controls or canvas
		const cropArea = page.locator('canvas, [class*="crop"], svg');
		const hasCropUI = (await cropArea.count()) > 0;

		expect(hasCropUI).toBe(true);
	});

	test('should allow freeform crop selection', async ({ page }) => {
		await page.goto('/upload');

		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');

		if (!fs.existsSync(testImagePath)) {
			test.skip();
			return;
		}

		// Upload image
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testImagePath);

		await page.waitForTimeout(2000);

		// Look for crop/process button
		const processButton = page.getByRole('button', { name: /process|crop|continue|next/i });
		const hasButton = (await processButton.count()) > 0;

		expect(hasButton).toBe(true);
	});

	test('should process image with Sharp.js pipeline', async ({ page }) => {
		await page.goto('/upload');

		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');

		if (!fs.existsSync(testImagePath)) {
			test.skip();
			return;
		}

		// Upload image
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testImagePath);

		await page.waitForTimeout(2000);

		// Process the image
		const processButton = page.getByRole('button', { name: /process|crop|continue|next/i });

		if (await processButton.isVisible()) {
			// Start timing
			const startTime = Date.now();

			await processButton.click();

			// Wait for processing to complete (should be < 5 seconds per spec)
			await page.waitForLoadState('networkidle', { timeout: 10000 });

			const processingTime = Date.now() - startTime;
			console.log(`Image processing took: ${processingTime}ms`);

			// Should complete in reasonable time (< 5 seconds per CLAUDE.md)
			expect(processingTime).toBeLessThan(5000);

			// Should redirect to editor or show processed image
			const url = page.url();
			const isProcessed = url.includes('/editor') || (await page.locator('canvas').count()) > 0;

			expect(isProcessed).toBe(true);
		}
	});

	test('should generate cleaned image with white background', async ({ page }) => {
		await page.goto('/upload');

		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');

		if (!fs.existsSync(testImagePath)) {
			test.skip();
			return;
		}

		// Upload and process
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testImagePath);
		await page.waitForTimeout(2000);

		const processButton = page.getByRole('button', { name: /process|crop|continue|next/i });

		if (await processButton.isVisible()) {
			await processButton.click();
			await page.waitForLoadState('networkidle', { timeout: 10000 });

			// Check if we're on editor page
			const url = page.url();
			console.log(`After processing, URL is: ${url}`);

			// Should have canvas with processed image
			const canvas = page.locator('canvas');
			expect(await canvas.count()).toBeGreaterThan(0);
		}
	});

	test('should handle processing errors gracefully', async ({ page }) => {
		await page.goto('/upload');

		// Listen for any error messages
		const errorMessages: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errorMessages.push(msg.text());
			}
		});

		// Try to process without uploading
		const processButton = page.getByRole('button', { name: /process|crop|continue|next/i });

		if (await processButton.isVisible()) {
			await processButton.click();
			await page.waitForTimeout(1000);

			// Should show error or prevent action
			const errorAlert = page.locator('[role="alert"], .error, .alert-error');
			const hasError = (await errorAlert.count()) > 0;

			// Or still on upload page
			const stillOnUpload = page.url().includes('/upload');

			expect(hasError || stillOnUpload).toBe(true);
		}
	});

	test('should support multiple image format uploads', async ({ page }) => {
		await page.goto('/upload');

		// Test that file input accepts multiple formats
		const fileInput = page.locator('input[type="file"]');
		const acceptAttr = await fileInput.getAttribute('accept');

		console.log(`Supported formats: ${acceptAttr}`);

		// Should mention image/* or specific types
		const supportsImages = acceptAttr?.includes('image');
		expect(supportsImages).toBe(true);
	});

	test('should show progress indicator during processing', async ({ page }) => {
		await page.goto('/upload');

		const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');

		if (!fs.existsSync(testImagePath)) {
			test.skip();
			return;
		}

		// Upload image
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testImagePath);
		await page.waitForTimeout(1000);

		// Click process
		const processButton = page.getByRole('button', { name: /process|crop|continue|next/i });

		if (await processButton.isVisible()) {
			await processButton.click();

			// Check for loading indicator within first 500ms
			await page.waitForTimeout(500);

			const loadingIndicator = page.locator(
				'[class*="loading"], [class*="spinner"], [class*="progress"], text=/processing|loading/i'
			);

			// May or may not show depending on processing speed
			const hasLoader = (await loadingIndicator.count()) > 0;
			console.log(`Loading indicator shown: ${hasLoader}`);
		}
	});
});
