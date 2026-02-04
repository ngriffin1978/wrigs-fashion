<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getTemplateById, type DollTemplate, type OutfitRegion } from '$lib/data/doll-templates';

	let templateId = $state('');
	let designImageUrl = $state('');
	let template = $state<DollTemplate | null>(null);
	let outfitCategory = $state<'top' | 'bottom' | 'dress' | 'shoes'>('top');

	// Design positioning
	let designX = $state(0);
	let designY = $state(0);
	let designScale = $state(1);
	let designRotation = $state(0);

	// Canvas refs
	let previewCanvas: HTMLCanvasElement | undefined;
	let ctx: CanvasRenderingContext2D | null = null;

	let dollImage: HTMLImageElement | null = null;
	let designImage: HTMLImageElement | null = null;
	let loading = $state(true);
	let generating = $state(false);

	onMount(() => {
		templateId = $page.url.searchParams.get('template') || '';
		designImageUrl = $page.url.searchParams.get('design') || '';

		if (!templateId || !designImageUrl) {
			alert('Missing template or design. Please start over.');
			window.location.href = '/doll-builder';
			return;
		}

		template = getTemplateById(templateId);
		if (!template) {
			alert('Template not found');
			window.location.href = '/doll-builder';
			return;
		}

		loadImages();
	});

	function loadImages() {
		let loadedCount = 0;
		const totalImages = 2;

		function checkLoaded() {
			loadedCount++;
			if (loadedCount === totalImages) {
				loading = false;
				initializeCanvas();
			}
		}

		// Load doll template
		const doll = new Image();
		doll.crossOrigin = 'anonymous';
		doll.onload = () => {
			dollImage = doll;
			checkLoaded();
		};
		doll.src = template!.baseImageUrl;

		// Load design image
		const design = new Image();
		design.crossOrigin = 'anonymous';
		design.onload = () => {
			designImage = design;
			checkLoaded();
		};
		design.src = designImageUrl;
	}

	function initializeCanvas() {
		if (!previewCanvas || !template) return;
		ctx = previewCanvas.getContext('2d');
		if (!ctx) return;

		previewCanvas.width = template.viewBox.width;
		previewCanvas.height = template.viewBox.height;

		// Set initial position based on selected region
		const region = getCurrentRegion();
		designX = region.x + region.width / 2;
		designY = region.y + region.height / 2;
		designScale = Math.min(region.width / (designImage?.width || 200), region.height / (designImage?.height || 200));

		drawPreview();
	}

	function getCurrentRegion(): OutfitRegion {
		if (!template) return { x: 0, y: 0, width: 100, height: 100 };

		switch (outfitCategory) {
			case 'top':
				return template.regions.topRegion;
			case 'bottom':
				return template.regions.bottomRegion;
			case 'dress':
				return template.regions.dressRegion;
			case 'shoes':
				return template.regions.shoesRegion;
			default:
				return template.regions.topRegion;
		}
	}

	function drawPreview() {
		if (!ctx || !previewCanvas || !dollImage || !designImage) return;

		// Clear canvas
		ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

		// Draw doll template
		ctx.drawImage(dollImage, 0, 0);

		// Draw placement region guide (semi-transparent)
		const region = getCurrentRegion();
		ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.strokeRect(region.x, region.y, region.width, region.height);
		ctx.setLineDash([]);

		// Draw design image
		ctx.save();
		ctx.translate(designX, designY);
		ctx.rotate((designRotation * Math.PI) / 180);
		ctx.scale(designScale, designScale);
		ctx.drawImage(designImage, -designImage.width / 2, -designImage.height / 2);
		ctx.restore();
	}

	// Update preview when parameters change
	$effect(() => {
		if (outfitCategory && template) {
			const region = getCurrentRegion();
			designX = region.x + region.width / 2;
			designY = region.y + region.height / 2;
			designScale = Math.min(region.width / (designImage?.width || 200), region.height / (designImage?.height || 200));
			drawPreview();
		}
	});

	$effect(() => {
		if (designX || designY || designScale || designRotation) {
			drawPreview();
		}
	});

	async function generatePDF() {
		if (!template) return;

		generating = true;
		try {
			const response = await fetch('/api/generate-pdf', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					templateId: template.id,
					designImageUrl,
					placement: {
						category: outfitCategory,
						x: designX,
						y: designY,
						scale: designScale,
						rotation: designRotation
					}
				})
			});

			if (response.ok) {
				const data = await response.json();
				// Download the PDF
				window.open(data.pdfUrl, '_blank');
				// Optionally navigate to portfolio
				setTimeout(() => {
					window.location.href = '/portfolio';
				}, 1000);
			} else {
				const error = await response.json();
				alert(error.message || 'Failed to generate PDF');
			}
		} catch (error) {
			alert('Error generating PDF. Please try again.');
		} finally {
			generating = false;
		}
	}
</script>

<svelte:head>
	<title>Place Your Design - Wrigs Fashion</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100 p-4">
	<div class="container mx-auto max-w-6xl">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-bold">
				<span class="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
					Place Your Design on the Doll
				</span>
			</h1>
			<button class="btn btn-outline" onclick={() => window.history.back()}>
				← Back to Templates
			</button>
		</div>

		{#if loading}
			<div class="card bg-white shadow-xl p-12">
				<div class="flex flex-col items-center gap-4">
					<span class="loading loading-spinner loading-lg"></span>
					<p class="text-lg">Loading your design...</p>
				</div>
			</div>
		{:else}
			<div class="grid lg:grid-cols-[1fr_350px] gap-6">
				<!-- Canvas Preview -->
				<div class="card bg-white shadow-xl p-6">
					<h2 class="text-xl font-bold mb-4">Preview</h2>
					<div class="flex justify-center items-center bg-gray-50 rounded-lg p-4">
						<canvas
							bind:this={previewCanvas}
							class="max-w-full h-auto border-2 border-gray-300 rounded"
						></canvas>
					</div>
				</div>

				<!-- Controls -->
				<div class="card bg-white shadow-xl p-6">
					<h2 class="text-xl font-bold mb-4">Placement Controls</h2>

					<!-- Outfit Category -->
					<div class="mb-6">
						<label class="label">
							<span class="label-text font-bold">Outfit Type:</span>
						</label>
						<div class="flex flex-col gap-2">
							<label class="btn btn-outline" class:btn-primary={outfitCategory === 'top'}>
								<input
									type="radio"
									name="category"
									value="top"
									bind:group={outfitCategory}
									class="hidden"
								/>
								👚 Top / Shirt
							</label>
							<label class="btn btn-outline" class:btn-primary={outfitCategory === 'bottom'}>
								<input
									type="radio"
									name="category"
									value="bottom"
									bind:group={outfitCategory}
									class="hidden"
								/>
								👖 Bottom / Pants
							</label>
							<label class="btn btn-outline" class:btn-primary={outfitCategory === 'dress'}>
								<input
									type="radio"
									name="category"
									value="dress"
									bind:group={outfitCategory}
									class="hidden"
								/>
								👗 Dress
							</label>
							<label class="btn btn-outline" class:btn-primary={outfitCategory === 'shoes'}>
								<input
									type="radio"
									name="category"
									value="shoes"
									bind:group={outfitCategory}
									class="hidden"
								/>
								👟 Shoes
							</label>
						</div>
					</div>

					<!-- Position Controls -->
					<div class="mb-4">
						<label class="label">
							<span class="label-text font-semibold">Horizontal Position</span>
						</label>
						<input
							type="range"
							min="0"
							max={template?.viewBox.width || 400}
							bind:value={designX}
							class="range range-primary range-sm"
						/>
					</div>

					<div class="mb-4">
						<label class="label">
							<span class="label-text font-semibold">Vertical Position</span>
						</label>
						<input
							type="range"
							min="0"
							max={template?.viewBox.height || 600}
							bind:value={designY}
							class="range range-primary range-sm"
						/>
					</div>

					<!-- Scale Control -->
					<div class="mb-4">
						<label class="label">
							<span class="label-text font-semibold">Size: {(designScale * 100).toFixed(0)}%</span>
						</label>
						<input
							type="range"
							min="0.2"
							max="2"
							step="0.05"
							bind:value={designScale}
							class="range range-secondary range-sm"
						/>
					</div>

					<!-- Rotation Control -->
					<div class="mb-6">
						<label class="label">
							<span class="label-text font-semibold">Rotation: {designRotation}°</span>
						</label>
						<input
							type="range"
							min="-45"
							max="45"
							step="1"
							bind:value={designRotation}
							class="range range-accent range-sm"
						/>
					</div>

					<!-- Generate Button -->
					<div class="divider"></div>
					<button
						class="btn btn-success btn-lg w-full"
						onclick={generatePDF}
						disabled={generating}
					>
						{#if generating}
							<span class="loading loading-spinner"></span>
							Generating PDF...
						{:else}
							🖨️ Generate Paper Doll PDF
						{/if}
					</button>

					<div class="alert alert-info mt-4 text-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-current shrink-0 w-4 h-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span>Your PDF will include cut lines and tabs for easy assembly!</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.btn.btn-primary {
		border-width: 3px;
	}
</style>
