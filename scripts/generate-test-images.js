// Generate test images for Playwright tests
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturesDir = join(__dirname, '../tests/fixtures');

// Create fixtures directory if it doesn't exist
mkdirSync(fixturesDir, { recursive: true });

async function generateTestImages() {
	console.log('Generating test images...');

	try {
		// 1. test-image.jpg - Standard JPG (~2MB)
		// Create a 2000x2000 colorful gradient image
		const testImageJpg = await sharp({
			create: {
				width: 2000,
				height: 2000,
				channels: 3,
				background: { r: 255, g: 200, b: 200 }
			}
		})
			.jpeg({ quality: 90 })
			.toBuffer();

		writeFileSync(join(fixturesDir, 'test-image.jpg'), testImageJpg);
		console.log('✓ Created test-image.jpg');

		// 2. test-sketch.png - Fashion sketch drawing
		// Create a simple sketch-like image with white background
		const testSketchPng = await sharp({
			create: {
				width: 1500,
				height: 2000,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 }
			}
		})
			.png()
			.toBuffer();

		writeFileSync(join(fixturesDir, 'test-sketch.png'), testSketchPng);
		console.log('✓ Created test-sketch.png');

		// 3. test-image.png - PNG with transparency (optional, for completeness)
		const testImagePng = await sharp({
			create: {
				width: 1000,
				height: 1000,
				channels: 4,
				background: { r: 200, g: 220, b: 255, alpha: 0.8 }
			}
		})
			.png()
			.toBuffer();

		writeFileSync(join(fixturesDir, 'test-image.png'), testImagePng);
		console.log('✓ Created test-image.png');

		console.log('\nTest images generated successfully!');
		console.log('Location:', fixturesDir);
	} catch (error) {
		console.error('Error generating test images:', error);
		process.exit(1);
	}
}

generateTestImages();
