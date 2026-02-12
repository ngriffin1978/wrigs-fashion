#!/usr/bin/env node

/**
 * Test script to verify catalog creation bug fix
 * This simulates the browser flow: POST to create catalog, then GET to fetch it
 */

const http = require('http');

const BASE_URL = 'http://localhost';
const PORT = 3000;

// Store cookies between requests
let cookies = '';

function makeRequest(method, path, body = null) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'localhost',
			port: PORT,
			path: path,
			method: method,
			headers: {
				'Content-Type': 'application/json',
			}
		};

		// Include cookies if we have them
		if (cookies) {
			options.headers['Cookie'] = cookies;
		}

		const req = http.request(options, (res) => {
			let data = '';

			// Capture Set-Cookie headers
			const setCookieHeaders = res.headers['set-cookie'];
			if (setCookieHeaders) {
				console.log('  ✓ Received Set-Cookie headers:', setCookieHeaders);
				// Store cookies for next request
				cookies = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
			}

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					headers: res.headers,
					body: data,
					cookies: setCookieHeaders
				});
			});
		});

		req.on('error', (e) => {
			reject(e);
		});

		if (body) {
			req.write(JSON.stringify(body));
		}

		req.end();
	});
}

async function testCatalogCreation() {
	console.log('🧪 Testing Catalog Creation Flow\n');
	console.log('=' .repeat(60));

	try {
		// Step 1: Create catalog
		console.log('\n📝 Step 1: Creating catalog via POST /api/catalogs');
		const createResponse = await makeRequest('POST', '/api/catalogs', {
			title: 'Test Catalog ' + Date.now()
		});

		console.log(`  Status: ${createResponse.statusCode}`);

		if (createResponse.statusCode !== 201) {
			console.error('  ❌ Failed to create catalog');
			console.error('  Response:', createResponse.body);
			process.exit(1);
		}

		const catalog = JSON.parse(createResponse.body);
		console.log(`  ✓ Catalog created with ID: ${catalog.id}`);
		console.log(`  ✓ Session ID in catalog: ${catalog.sessionId}`);
		console.log(`  ✓ User ID in catalog: ${catalog.userId || 'null (anonymous)'}`);
		console.log(`  ✓ Current cookies: ${cookies}`);

		// Step 2: Simulate the 100ms delay from our fix
		console.log('\n⏱️  Step 2: Waiting 100ms (simulating browser cookie processing)');
		await new Promise(resolve => setTimeout(resolve, 100));
		console.log('  ✓ Wait complete');

		// Step 3: Fetch the catalog
		console.log(`\n📖 Step 3: Fetching catalog via GET /api/catalogs/${catalog.id}`);
		console.log(`  Sending cookies: ${cookies}`);

		const fetchResponse = await makeRequest('GET', `/api/catalogs/${catalog.id}`);

		console.log(`  Status: ${fetchResponse.statusCode}`);

		if (fetchResponse.statusCode === 404) {
			console.error('\n❌ BUG STILL EXISTS: Catalog not found!');
			console.error('  The catalog was created but cannot be accessed immediately after.');
			console.error('  Response:', fetchResponse.body);
			process.exit(1);
		}

		if (fetchResponse.statusCode === 200) {
			const fetchedCatalog = JSON.parse(fetchResponse.body);
			console.log(`  ✓ Catalog fetched successfully`);
			console.log(`  ✓ Title: ${fetchedCatalog.title}`);
			console.log(`  ✓ ID matches: ${fetchedCatalog.id === catalog.id}`);

			console.log('\n' + '='.repeat(60));
			console.log('✅ SUCCESS: Catalog creation and retrieval working correctly!');
			console.log('='.repeat(60));
			process.exit(0);
		} else {
			console.error(`\n❌ Unexpected status code: ${fetchResponse.statusCode}`);
			console.error('  Response:', fetchResponse.body);
			process.exit(1);
		}

	} catch (error) {
		console.error('\n❌ Error during test:', error.message);
		process.exit(1);
	}
}

// Run the test
testCatalogCreation();
