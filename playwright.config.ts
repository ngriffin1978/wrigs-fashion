import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for Wrigs Fashion
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',

	/* Run tests in files in parallel */
	fullyParallel: false, // Run sequentially to avoid DB conflicts

	/* Fail the build on CI if you accidentally left test.only in the source code */
	forbidOnly: !!process.env.CI,

	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,

	/* Opt out of parallel tests on CI */
	workers: process.env.CI ? 1 : 1,

	/* Reporter to use */
	reporter: [
		['html'],
		['list'],
		['json', { outputFile: 'test-results/results.json' }]
	],

	/* Shared settings for all the projects below */
	use: {
		/* Base URL to use in actions like `await page.goto('/')` */
		baseURL: 'https://srv1315945.hstgr.cloud',

		/* Ignore HTTPS certificate errors (self-signed cert) */
		ignoreHTTPSErrors: true,

		/* Collect trace when retrying the failed test */
		trace: 'on-first-retry',

		/* Screenshot on failure */
		screenshot: 'only-on-failure',

		/* Video on failure */
		video: 'retain-on-failure',

		/* Maximum time each action can take */
		actionTimeout: 10000,

		/* Maximum time for navigation */
		navigationTimeout: 30000,
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 720 }
			},
		},

		// Uncomment to test on other browsers
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// },

		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] },
		// },

		/* Test against mobile viewports (important for kid-friendly design) */
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5'],
			},
		},

		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 12'],
			},
		},

		/* Test against tablet viewports (primary target device) */
		{
			name: 'iPad',
			use: {
				...devices['iPad Pro'],
			},
		},
	],

	/* Timeout for each test */
	timeout: 60000,

	/* Timeout for the whole test suite */
	globalTimeout: 600000,
});
