import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generatePaperDollPDF, type PlacementData } from '$lib/services/pdf-generator';
import { join } from 'path';
import { existsSync } from 'fs';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { templateId, designImageUrl, placement, paperSize = 'letter' } = body;

		// Validate input
		if (!templateId || !designImageUrl || !placement) {
			throw error(400, 'Missing required fields: templateId, designImageUrl, or placement');
		}

		// Validate placement data
		if (!placement.category || typeof placement.x !== 'number' || typeof placement.y !== 'number') {
			throw error(400, 'Invalid placement data');
		}

		// Convert design URL to local file path
		// URLs like /uploads/xxx.png -> static/uploads/xxx.png
		let designImagePath: string;
		if (designImageUrl.startsWith('http://') || designImageUrl.startsWith('https://')) {
			// Handle full URLs (fetch from remote)
			// For now, we'll require local files
			throw error(400, 'Remote design URLs not yet supported. Please use local uploads.');
		} else {
			// Local path - convert URL to file system path
			designImagePath = join(process.cwd(), 'static', designImageUrl.replace(/^\//, ''));
		}

		// Check if design image exists
		if (!existsSync(designImagePath)) {
			throw error(404, `Design image not found at path: ${designImageUrl}`);
		}

		// Generate PDF
		const result = await generatePaperDollPDF({
			templateId,
			designImagePath,
			placement: placement as PlacementData,
			paperSize: paperSize === 'a4' ? 'a4' : 'letter'
		});

		return json({
			success: true,
			pdfUrl: result.pdfUrl,
			filename: result.filename,
			message: 'PDF generated successfully!'
		});
	} catch (err: any) {
		console.error('PDF generation error:', err);

		// Handle SvelteKit errors
		if (err?.status) {
			throw err;
		}

		// Generic error
		throw error(500, err?.message || 'Failed to generate PDF');
	}
};
