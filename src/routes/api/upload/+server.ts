import { json, type RequestHandler } from '@sveltejs/kit';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = 'static/uploads';
const MAX_DIMENSION = 2000;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type - support various HEIC/HEIF MIME types from different devices
		const allowedTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/heic',
			'image/heif',
			'image/heic-sequence',
			'image/heif-sequence'
		];

		// Get file extension as fallback (iOS sometimes sends empty MIME type)
		const fileName = file.name.toLowerCase();
		const hasValidExtension =
			fileName.endsWith('.jpg') ||
			fileName.endsWith('.jpeg') ||
			fileName.endsWith('.png') ||
			fileName.endsWith('.heic') ||
			fileName.endsWith('.heif');

		// Accept if either MIME type is valid OR extension is valid (handles iOS edge cases)
		const isValidType = allowedTypes.includes(file.type) || (file.type === '' && hasValidExtension);

		if (!isValidType) {
			return json(
				{
					error: 'Invalid file type. Please upload JPG, PNG, or HEIC',
					debug: { mimeType: file.type, fileName: file.name }
				},
				{ status: 400 }
			);
		}

		// Validate file size (10MB)
		if (file.size > 10 * 1024 * 1024) {
			return json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
		}

		// Ensure upload directory exists
		if (!existsSync(UPLOAD_DIR)) {
			await mkdir(UPLOAD_DIR, { recursive: true });
		}

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Detect if file is HEIC/HEIF format (iOS photos)
		const isHeic = fileName.endsWith('.heic') ||
		               fileName.endsWith('.heif') ||
		               file.type === 'image/heic' ||
		               file.type === 'image/heif' ||
		               file.type === 'image/heic-sequence' ||
		               file.type === 'image/heif-sequence';

		// Generate unique filename
		const fileId = nanoid(10);
		const originalPath = path.join(UPLOAD_DIR, `${fileId}-original.png`);
		const cleanedPath = path.join(UPLOAD_DIR, `${fileId}-cleaned.png`);

		// Create Sharp instance with format hint for HEIC files
		// This is critical because Sharp's HEIF loader only recognizes .avif by default
		const sharpOptions = isHeic ? { pages: -1 } : {};

		// Save original (converted to PNG)
		await sharp(buffer, sharpOptions)
			.resize(MAX_DIMENSION, MAX_DIMENSION, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.png()
			.toFile(originalPath);

		// Process image: Remove background, enhance drawing colors, reduce color palette
		// Step 1: Boost brightness aggressively to blow out the background
		const processed = sharp(buffer, sharpOptions)
			.resize(MAX_DIMENSION, MAX_DIMENSION, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.modulate({
				brightness: 1.4, // Blow out light background
				saturation: 1.5  // Make drawing colors pop
			})
			.linear(1.3, 20) // Boost contrast and brightness
			.normalise() // Auto-level to push background to white
			.sharpen({ sigma: 1.5 }); // Crisp edges

		// Step 2: Reduce color palette (posterize) for better wand tool performance
		// This consolidates similar colors into distinct groups
		const processedBuffer = await processed
			.toColourspace('srgb')
			.toBuffer();

		// Step 3: Apply color quantization to reduce to ~32 colors
		// This makes the wand tool much more effective
		const quantized = await sharp(processedBuffer)
			.png({ palette: true, colours: 32, dither: 0 }) // Reduce to 32 colors, no dithering
			.toBuffer();

		// Step 4: Add to neutral background with padding
		await sharp(quantized)
			.flatten({ background: '#f8f8f8' }) // Light gray neutral background
			.extend({
				top: 60,
				bottom: 60,
				left: 60,
				right: 60,
				background: { r: 248, g: 248, b: 248, alpha: 1 } // Matching neutral gray
			})
			.png()
			.toFile(cleanedPath);

		return json({
			success: true,
			fileId,
			originalUrl: `/uploads/${fileId}-original.png`,
			cleanedUrl: `/uploads/${fileId}-cleaned.png`,
			fileName: file.name,
			fileSize: file.size
		});
	} catch (error) {
		console.error('Upload error:', error);

		// Provide specific error message for HEIC/HEIF format issues
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const isHeicError = errorMessage.toLowerCase().includes('heif') ||
		                    errorMessage.toLowerCase().includes('heic') ||
		                    errorMessage.toLowerCase().includes('unsupported');

		return json(
			{
				error: isHeicError
					? 'Failed to process HEIC/HEIF image. This format may not be fully supported. Please try converting to JPG or PNG first.'
					: 'Failed to process image',
				details: errorMessage,
				fileName: formData.get('file')?.name || 'unknown'
			},
			{ status: 500 }
		);
	}
};
