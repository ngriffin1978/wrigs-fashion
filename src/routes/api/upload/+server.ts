import { json, type RequestHandler } from '@sveltejs/kit';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import heicConvert from 'heic-convert';

const UPLOAD_DIR = 'static/uploads';
const MAX_DIMENSION = 2000;

export const POST: RequestHandler = async ({ request }) => {
	try {
		console.log('📤 Upload request received');
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			console.log('❌ No file provided in request');
			return json({ error: 'No file provided' }, { status: 400 });
		}

		console.log('📋 File info:', {
			name: file.name,
			size: file.size,
			type: file.type,
			lastModified: file.lastModified
		});

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

		console.log('✅ Validation result:', {
			isValidType,
			mimeTypeMatched: allowedTypes.includes(file.type),
			extensionMatched: hasValidExtension,
			emptyMimeType: file.type === ''
		});

		if (!isValidType) {
			console.log('❌ Invalid file type:', { mimeType: file.type, fileName: file.name });
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
			console.log('❌ File too large:', file.size);
			return json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
		}

		// Ensure upload directory exists
		if (!existsSync(UPLOAD_DIR)) {
			console.log('📁 Creating upload directory');
			await mkdir(UPLOAD_DIR, { recursive: true });
		}

		// Convert file to buffer
		console.log('🔄 Converting file to buffer...');
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		console.log('✅ Buffer created:', buffer.length, 'bytes');

		// Detect if file is HEIC/HEIF format (iOS photos)
		const isHeic = fileName.endsWith('.heic') ||
		               fileName.endsWith('.heif') ||
		               file.type === 'image/heic' ||
		               file.type === 'image/heif' ||
		               file.type === 'image/heic-sequence' ||
		               file.type === 'image/heif-sequence';

		console.log('🖼️ Image format detection:', { isHeic, fileName });

		// Convert HEIC to JPEG if needed (server-side conversion for iOS compatibility)
		let processBuffer = buffer;
		if (isHeic) {
			console.log('🔄 Converting HEIC to JPEG...');
			try {
				const jpegBuffer = await heicConvert({
					buffer: buffer,
					format: 'JPEG',
					quality: 0.95
				});
				processBuffer = Buffer.from(jpegBuffer);
				console.log('✅ HEIC converted to JPEG:', processBuffer.length, 'bytes');
			} catch (heicError) {
				console.error('❌ HEIC conversion failed:', heicError);
				return json(
					{
						error: 'Failed to convert HEIC image. Please try converting to JPG or PNG first.',
						details: heicError instanceof Error ? heicError.message : 'Unknown error'
					},
					{ status: 500 }
				);
			}
		}

		// Generate unique filename
		const fileId = nanoid(10);
		const originalPath = path.join(UPLOAD_DIR, `${fileId}-original.png`);
		const cleanedPath = path.join(UPLOAD_DIR, `${fileId}-cleaned.png`);

		console.log('📝 Generated file ID:', fileId);
		console.log('🎨 Starting image processing with Sharp...');

		// Save original (converted to PNG)
		await sharp(processBuffer)
			.resize(MAX_DIMENSION, MAX_DIMENSION, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.png()
			.toFile(originalPath);

		// Process image: Remove background, enhance drawing colors, reduce color palette
		// Step 1: Boost brightness aggressively to blow out the background
		const processed = sharp(processBuffer)
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

		console.log('✅ Upload successful!', {
			fileId,
			originalUrl: `/uploads/${fileId}-original.png`,
			cleanedUrl: `/uploads/${fileId}-cleaned.png`
		});

		return json({
			success: true,
			fileId,
			originalUrl: `/uploads/${fileId}-original.png`,
			cleanedUrl: `/uploads/${fileId}-cleaned.png`,
			fileName: file.name,
			fileSize: file.size
		});
	} catch (error) {
		console.error('❌ Upload error:', error);
		console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		return json(
			{
				error: 'Failed to process image',
				details: errorMessage
			},
			{ status: 500 }
		);
	}
};
