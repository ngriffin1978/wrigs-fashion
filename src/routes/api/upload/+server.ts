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

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
		if (!allowedTypes.includes(file.type)) {
			return json({ error: 'Invalid file type. Please upload JPG, PNG, or HEIC' }, { status: 400 });
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

		// Generate unique filename
		const fileId = nanoid(10);
		const originalPath = path.join(UPLOAD_DIR, `${fileId}-original.png`);
		const cleanedPath = path.join(UPLOAD_DIR, `${fileId}-cleaned.png`);

		// Save original (converted to PNG)
		await sharp(buffer)
			.resize(MAX_DIMENSION, MAX_DIMENSION, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.png()
			.toFile(originalPath);

		// Process image: Remove background, enhance drawing colors
		// Step 1: Boost brightness aggressively to blow out the background
		await sharp(buffer)
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
			.sharpen({ sigma: 1.5 }) // Crisp edges
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
		return json(
			{
				error: 'Failed to process image',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
