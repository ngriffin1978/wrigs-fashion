import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { getTemplateById } from '$lib/data/doll-templates';
import type { OutfitRegion } from '$lib/data/doll-templates';

export interface PlacementData {
	category: 'top' | 'bottom' | 'dress' | 'shoes';
	x: number;
	y: number;
	scale: number;
	rotation: number;
}

export interface PDFGenerationOptions {
	templateId: string;
	designImagePath: string; // Local file path
	placement: PlacementData;
	paperSize?: 'letter' | 'a4';
}

export interface PDFResult {
	pdfPath: string;
	pdfUrl: string;
	filename: string;
}

// Paper sizes in points (72 points = 1 inch)
const PAPER_SIZES = {
	letter: { width: 612, height: 792 }, // 8.5 x 11 inches
	a4: { width: 595, height: 842 } // 210 x 297 mm
};

const MARGIN = 36; // 0.5 inch margin

/**
 * Generate a printable paper doll PDF with:
 * - Page 1: Doll base with cut lines
 * - Page 2: Outfit piece with tabs and cut lines
 */
export async function generatePaperDollPDF(
	options: PDFGenerationOptions
): Promise<PDFResult> {
	const { templateId, designImagePath, placement, paperSize = 'letter' } = options;

	// Get template
	const template = getTemplateById(templateId);
	if (!template) {
		throw new Error('Template not found');
	}

	// Generate unique filename
	const timestamp = Date.now();
	const filename = `paper-doll-${templateId}-${timestamp}.pdf`;
	const pdfPath = join(process.cwd(), 'static', 'pdfs', filename);
	const pdfUrl = `/pdfs/${filename}`;

	// Get paper dimensions
	const paper = PAPER_SIZES[paperSize];

	return new Promise((resolve, reject) => {
		try {
			// Create PDF document
			const doc = new PDFDocument({
				size: paperSize === 'letter' ? 'LETTER' : 'A4',
				margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
				info: {
					Title: 'Wrigs Fashion Paper Doll',
					Author: 'Wrigs Fashion',
					Subject: 'Paper Doll Cutout',
					Keywords: 'paper doll, fashion, craft, printable'
				}
			});

			// Pipe to file
			const stream = createWriteStream(pdfPath);
			doc.pipe(stream);

			// PAGE 1: Paper Doll Base
			drawDollBasePage(doc, template, paper);

			// PAGE 2: Outfit Piece
			doc.addPage();
			drawOutfitPiecePage(doc, template, designImagePath, placement, paper);

			// Finalize PDF
			doc.end();

			stream.on('finish', () => {
				resolve({ pdfPath, pdfUrl, filename });
			});

			stream.on('error', (error) => {
				reject(error);
			});
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Draw Page 1: Paper doll base with cut lines and fold tab
 */
function drawDollBasePage(
	doc: PDFKit.PDFDocument,
	template: any,
	paper: { width: number; height: number }
) {
	const contentWidth = paper.width - MARGIN * 2;
	const contentHeight = paper.height - MARGIN * 2;

	// Calculate scale to fit doll on page
	const dollAspect = template.viewBox.width / template.viewBox.height;
	const pageAspect = contentWidth / contentHeight;

	let dollWidth, dollHeight;
	if (dollAspect > pageAspect) {
		// Fit to width
		dollWidth = contentWidth * 0.8; // Use 80% of page width
		dollHeight = dollWidth / dollAspect;
	} else {
		// Fit to height
		dollHeight = contentHeight * 0.8;
		dollWidth = dollHeight * dollAspect;
	}

	// Center the doll
	const x = MARGIN + (contentWidth - dollWidth) / 2;
	const y = MARGIN + (contentHeight - dollHeight) / 2;

	// Title
	doc.fontSize(20)
		.font('Helvetica-Bold')
		.text('Paper Doll Base', MARGIN, MARGIN, { align: 'center', width: contentWidth });

	// Instructions
	doc.fontSize(10)
		.font('Helvetica')
		.text('Cut along the dotted lines. Fold the bottom tab to make the doll stand.', MARGIN, MARGIN + 30, {
			align: 'center',
			width: contentWidth
		});

	// Draw doll template (simplified - in production, load actual SVG/image)
	try {
		// Try to load and draw the template image
		doc.image(template.baseImageUrl.replace('/templates/', 'static/templates/'), x, y + 50, {
			width: dollWidth,
			height: dollHeight
		});
	} catch (error) {
		// Fallback: draw placeholder
		doc.rect(x, y + 50, dollWidth, dollHeight).stroke();
		doc.fontSize(12).text('Doll Template', x, y + 50 + dollHeight / 2, {
			width: dollWidth,
			align: 'center'
		});
	}

	// Draw cut line guides around the doll
	doc.strokeColor('#999999')
		.lineWidth(1)
		.dash(5, 3)
		.rect(x - 5, y + 45, dollWidth + 10, dollHeight + 10)
		.stroke()
		.undash();

	// Footer with cute branding
	doc.fontSize(8)
		.fillColor('#666666')
		.text('✨ Made with Wrigs Fashion ✨', MARGIN, paper.height - MARGIN - 20, {
			align: 'center',
			width: contentWidth
		});
}

/**
 * Draw Page 2: Outfit piece with user's design, tabs, and cut lines
 */
function drawOutfitPiecePage(
	doc: PDFKit.PDFDocument,
	template: any,
	designImagePath: string,
	placement: PlacementData,
	paper: { width: number; height: number }
) {
	const contentWidth = paper.width - MARGIN * 2;
	const contentHeight = paper.height - MARGIN * 2;

	// Get the region for the selected category
	let region: OutfitRegion;
	switch (placement.category) {
		case 'top':
			region = template.regions.topRegion;
			break;
		case 'bottom':
			region = template.regions.bottomRegion;
			break;
		case 'dress':
			region = template.regions.dressRegion;
			break;
		case 'shoes':
			region = template.regions.shoesRegion;
			break;
		default:
			region = template.regions.topRegion;
	}

	// Calculate scale for outfit piece
	const regionAspect = region.width / region.height;
	const pageAspect = contentWidth / (contentHeight - 100); // Leave space for title

	let outfitWidth, outfitHeight;
	if (regionAspect > pageAspect) {
		outfitWidth = contentWidth * 0.7;
		outfitHeight = outfitWidth / regionAspect;
	} else {
		outfitHeight = (contentHeight - 100) * 0.7;
		outfitWidth = outfitHeight * regionAspect;
	}

	// Center the outfit piece
	const x = MARGIN + (contentWidth - outfitWidth) / 2;
	const y = MARGIN + 80;

	// Title
	doc.fontSize(20)
		.font('Helvetica-Bold')
		.text(`${getCategoryDisplayName(placement.category)} Outfit Piece`, MARGIN, MARGIN, {
			align: 'center',
			width: contentWidth
		});

	// Instructions
	doc.fontSize(10)
		.font('Helvetica')
		.text('Cut along the dotted lines. Fold the tabs to attach to your paper doll!', MARGIN, MARGIN + 30, {
			align: 'center',
			width: contentWidth
		});

	// Draw outfit background shape
	doc.fillColor('#ffffff')
		.strokeColor('#333333')
		.lineWidth(2)
		.roundedRect(x, y, outfitWidth, outfitHeight, 10)
		.fillAndStroke();

	// Draw the design image
	try {
		// Scale the design image to fit within the outfit region
		const designWidth = outfitWidth * 0.8;
		const designHeight = outfitHeight * 0.8;
		const designX = x + (outfitWidth - designWidth) / 2;
		const designY = y + (outfitHeight - designHeight) / 2;

		doc.image(designImagePath, designX, designY, {
			width: designWidth,
			height: designHeight,
			align: 'center',
			valign: 'center'
		});
	} catch (error) {
		// Fallback
		doc.fontSize(12)
			.fillColor('#666666')
			.text('Your Design Here', x, y + outfitHeight / 2, {
				width: outfitWidth,
				align: 'center'
			});
	}

	// Draw tabs at the top
	drawTab(doc, x + outfitWidth * 0.25, y - 15, 40, 15, 'top');
	drawTab(doc, x + outfitWidth * 0.75, y - 15, 40, 15, 'top');

	// Draw cut lines around the outfit piece
	doc.strokeColor('#999999')
		.lineWidth(1)
		.dash(5, 3)
		.roundedRect(x - 5, y - 20, outfitWidth + 10, outfitHeight + 25, 10)
		.stroke()
		.undash();

	// Footer
	doc.fontSize(8)
		.fillColor('#666666')
		.text('✨ Made with Wrigs Fashion ✨', MARGIN, paper.height - MARGIN - 20, {
			align: 'center',
			width: contentWidth
		});
}

/**
 * Draw a fold tab for attaching outfit to doll
 */
function drawTab(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	width: number,
	height: number,
	position: 'top' | 'bottom'
) {
	doc.fillColor('#f0f0f0')
		.strokeColor('#333333')
		.lineWidth(1)
		.roundedRect(x - width / 2, y, width, height, 3)
		.fillAndStroke();

	// Tab label
	doc.fontSize(6)
		.fillColor('#666666')
		.text('fold', x - width / 2, y + height / 2 - 3, {
			width: width,
			align: 'center'
		});
}

/**
 * Get display name for outfit category
 */
function getCategoryDisplayName(category: string): string {
	const names: Record<string, string> = {
		top: 'Top',
		bottom: 'Bottom',
		dress: 'Dress',
		shoes: 'Shoes'
	};
	return names[category] || category;
}
