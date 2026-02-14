<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AddToCatalogModal from '$lib/components/catalog/AddToCatalogModal.svelte';

	interface Props {
		data: {
			user: {
				id: string;
				email: string;
				nickname: string;
			} | null;
		};
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | null = null;
	let isDrawing = $state(false);
	let showCatalogModal = $state(false);
	let savedImageUrl = $state('');
	let brushSize = $state(10);
	let brushColor = $state('#000000');
	let tool = $state<'brush' | 'eraser' | 'spray' | 'glitter' | 'stamp' | 'wand'>('brush');
	let pattern = $state<'solid' | 'dots' | 'stripes' | 'stars' | 'hearts' | 'sparkles'>('solid');
	let imageUrl = $state('');
	let backgroundImage: HTMLImageElement | null = null;
	let canvasReady = $state(false);
	let saving = $state(false);

	// Get image URL from query params
	$effect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const url = params.get('image') || '';
			if (url) {
				imageUrl = url;
			}
		}
	});

	// Initialize canvas when it's ready
	$effect(() => {
		if (canvas && !canvasReady) {
			ctx = canvas.getContext('2d');
			canvasReady = true;
			if (imageUrl && ctx) {
				loadImage(imageUrl);
			}
		}
	});

	// Load image when URL changes
	$effect(() => {
		if (imageUrl && ctx && canvasReady) {
			loadImage(imageUrl);
		}
	});

	function loadImage(url: string) {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			backgroundImage = img;
			if (canvas && ctx) {
				// Set canvas size to match image
				canvas.width = img.width;
				canvas.height = img.height;
				// Draw image as background
				ctx.drawImage(img, 0, 0);
			}
		};
		img.src = url;
	}

	function startDrawing(e: MouseEvent) {
		if (!ctx || !canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) * (canvas.width / rect.width);
		const y = (e.clientY - rect.top) * (canvas.height / rect.height);

		// Magic wand tool - single click to remove color
		if (tool === 'wand') {
			removeColorAtPoint(Math.floor(x), Math.floor(y));
			return;
		}

		isDrawing = true;
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function draw(e: MouseEvent) {
		if (!isDrawing || !ctx || !canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) * (canvas.width / rect.width);
		const y = (e.clientY - rect.top) * (canvas.height / rect.height);

		ctx.globalCompositeOperation = 'source-over';

		if (tool === 'brush') {
			drawBrush(x, y);
		} else if (tool === 'eraser') {
			ctx.globalCompositeOperation = 'destination-out';
			ctx.lineWidth = brushSize;
			ctx.lineCap = 'round';
			ctx.lineTo(x, y);
			ctx.stroke();
		} else if (tool === 'spray') {
			drawSpray(x, y);
		} else if (tool === 'glitter') {
			drawGlitter(x, y);
		} else if (tool === 'stamp') {
			drawStamp(x, y);
		}
	}

	function drawBrush(x: number, y: number) {
		if (!ctx) return;

		if (pattern === 'solid') {
			ctx.strokeStyle = brushColor;
			ctx.lineWidth = brushSize;
			ctx.lineCap = 'round';
			ctx.lineTo(x, y);
			ctx.stroke();
		} else {
			// Draw pattern brush
			drawPattern(x, y, brushSize);
		}
	}

	function drawSpray(x: number, y: number) {
		if (!ctx) return;
		// Spray paint: random dots in an area
		const density = 20;
		const radius = brushSize;

		for (let i = 0; i < density; i++) {
			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * radius;
			const sprayX = x + Math.cos(angle) * distance;
			const sprayY = y + Math.sin(angle) * distance;

			ctx.fillStyle = brushColor;
			ctx.fillRect(sprayX, sprayY, 2, 2);
		}
	}

	function drawGlitter(x: number, y: number) {
		if (!ctx) return;
		// Glitter: sparkly effect with multiple colors
		const sparkles = 15;
		const radius = brushSize;

		for (let i = 0; i < sparkles; i++) {
			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * radius;
			const sprayX = x + Math.cos(angle) * distance;
			const sprayY = y + Math.sin(angle) * distance;

			// Random bright colors for sparkle
			const brightness = Math.random() * 100 + 155;
			const sparkleColor = `rgba(${brightness}, ${brightness}, ${brightness}, ${Math.random()})`;

			ctx.fillStyle = sparkleColor;
			const size = Math.random() * 3 + 1;
			ctx.fillRect(sprayX, sprayY, size, size);
		}
	}

	function drawStamp(x: number, y: number) {
		if (!ctx) return;
		// Draw a stamp/sticker based on current pattern
		const size = brushSize * 2;

		ctx.fillStyle = brushColor;
		if (pattern === 'hearts') {
			drawHeart(x, y, size);
		} else if (pattern === 'stars') {
			drawStar(x, y, size);
		} else {
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function drawPattern(x: number, y: number, size: number) {
		if (!ctx) return;

		ctx.fillStyle = brushColor;

		if (pattern === 'dots') {
			// Polka dots
			const spacing = 8;
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					ctx.beginPath();
					ctx.arc(x + i * spacing, y + j * spacing, 3, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		} else if (pattern === 'stripes') {
			// Diagonal stripes
			ctx.lineWidth = 3;
			ctx.strokeStyle = brushColor;
			for (let i = -size; i <= size; i += 6) {
				ctx.beginPath();
				ctx.moveTo(x + i - size, y - size);
				ctx.lineTo(x + i + size, y + size);
				ctx.stroke();
			}
		} else if (pattern === 'stars') {
			drawStar(x, y, size / 2);
		} else if (pattern === 'hearts') {
			drawHeart(x, y, size / 2);
		} else if (pattern === 'sparkles') {
			// Multiple small sparkles
			for (let i = 0; i < 5; i++) {
				const offsetX = (Math.random() - 0.5) * size;
				const offsetY = (Math.random() - 0.5) * size;
				drawStar(x + offsetX, y + offsetY, 4);
			}
		}
	}

	function drawStar(x: number, y: number, size: number) {
		if (!ctx) return;
		const points = 5;
		const outerRadius = size;
		const innerRadius = size / 2;

		ctx.beginPath();
		for (let i = 0; i < points * 2; i++) {
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			const angle = (i * Math.PI) / points - Math.PI / 2;
			const px = x + Math.cos(angle) * radius;
			const py = y + Math.sin(angle) * radius;

			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.closePath();
		ctx.fill();
	}

	function drawHeart(x: number, y: number, size: number) {
		if (!ctx) return;
		const width = size;
		const height = size;

		ctx.beginPath();
		ctx.moveTo(x, y + height / 4);
		ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + height / 4);
		ctx.bezierCurveTo(x - width / 2, y + height / 2, x, y + height * 0.75, x, y + height);
		ctx.bezierCurveTo(x, y + height * 0.75, x + width / 2, y + height / 2, x + width / 2, y + height / 4);
		ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + height / 4);
		ctx.closePath();
		ctx.fill();
	}

	function removeColorAtPoint(x: number, y: number) {
		if (!ctx || !canvas) return;

		// Get the image data
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const pixels = imageData.data;

		// Get the color at the clicked point
		const index = (y * canvas.width + x) * 4;
		const targetR = pixels[index];
		const targetG = pixels[index + 1];
		const targetB = pixels[index + 2];
		const targetA = pixels[index + 3];

		// Color tolerance (how similar colors need to be)
		const tolerance = 30;

		// Remove all pixels with similar color
		for (let i = 0; i < pixels.length; i += 4) {
			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];
			const a = pixels[i + 3];

			// Calculate color difference
			const diff = Math.sqrt(
				Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2)
			);

			// If color is similar enough, make it transparent/white
			if (diff < tolerance && a > 0) {
				pixels[i] = 255; // R
				pixels[i + 1] = 255; // G
				pixels[i + 2] = 255; // B
				pixels[i + 3] = 0; // A (transparent)
			}
		}

		// Put the modified image data back
		ctx.putImageData(imageData, 0, 0);
	}

	function stopDrawing() {
		if (!ctx) return;
		isDrawing = false;
		ctx.beginPath();
	}

	function clearCanvas() {
		if (!ctx || !backgroundImage) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(backgroundImage, 0, 0);
	}

	function saveImage() {
		if (!canvas) return;
		const dataUrl = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.download = 'my-design.png';
		link.href = dataUrl;
		link.click();
	}

	async function saveToPortfolio() {
		if (!canvas || !data.user) return;

		saving = true;

		try {
			// Convert canvas to blob
			const blob = await new Promise<Blob | null>((resolve) =>
				canvas!.toBlob(resolve, 'image/png')
			);
			if (!blob) {
				alert('Failed to create image! 😅');
				saving = false;
				return;
			}

			// Upload to server
			const formData = new FormData();
			formData.append('file', blob, 'design.png');

			const uploadRes = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});
			const uploadData = await uploadRes.json();

			if (!uploadRes.ok) {
				alert(uploadData.error || 'Failed to upload! 😅');
				saving = false;
				return;
			}

			// Save to designs database
			const designTitle = prompt('Name your design:', 'My Fashion Design') || 'Untitled Design';

			const saveRes = await fetch('/api/designs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: designTitle,
					originalImageUrl: imageUrl,
					cleanedImageUrl: uploadData.cleanedUrl,
					coloredOverlayUrl: uploadData.cleanedUrl
				})
			});

			if (saveRes.ok) {
				alert('🎉 Design saved to your catalogs!');
				// Optionally redirect to catalogs
				const shouldGoToCatalogs = confirm('Go to your catalogs now?');
				if (shouldGoToCatalogs) {
					goto('/catalogs');
				}
			} else {
				alert('Failed to save design! 😅');
			}
		} catch (error) {
			console.error('Save error:', error);
			alert('Something went wrong! 😅');
		} finally {
			saving = false;
		}
	}

	async function saveToServerAndAddToCatalog() {
		if (!canvas) return;
		// Convert canvas to blob and upload
		const blob = await new Promise<Blob | null>((resolve) => canvas!.toBlob(resolve, 'image/png'));
		if (!blob) return;

		const formData = new FormData();
		formData.append('file', blob, 'design.png');

		try {
			const res = await fetch('/api/upload', { method: 'POST', body: formData });
			if (res.ok) {
				const data = await res.json();
				savedImageUrl = data.cleanedUrl;
				showCatalogModal = true;
			}
		} catch {
			// Silent fail — could add toast
		}
	}

	async function createPaperDoll() {
		if (!canvas) return;
		// Convert canvas to blob
		const blob = await new Promise<Blob | null>((resolve) => canvas!.toBlob(resolve, 'image/png'));
		if (!blob) return;

		const formData = new FormData();
		formData.append('file', blob, 'design.png');

		try {
			const res = await fetch('/api/upload', { method: 'POST', body: formData });
			if (res.ok) {
				const data = await res.json();
				// Navigate to doll builder with the edited design
				const designUrl = data.cleanedUrl || data.originalUrl;
				window.location.href = `/doll-builder?design=${encodeURIComponent(designUrl)}`;
			}
		} catch (error) {
			alert('Failed to save design. Please try again.');
		}
	}

	const colorPalette = [
		'#000000',
		'#FF6B6B',
		'#4ECDC4',
		'#45B7D1',
		'#FFA07A',
		'#98D8C8',
		'#F7DC6F',
		'#BB8FCE',
		'#85C1E2',
		'#F8B739',
		'#52B788',
		'#E63946'
	];
</script>

<svelte:head>
	<title>Color Your Design - Wrigs Fashion</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100 p-4">
	<div class="container mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-4xl font-bold">
				<span class="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
					Color Your Design 🎨
				</span>
			</h1>
			<div class="flex gap-2 flex-wrap">
				<button class="btn btn-outline" onclick={() => window.history.back()}>
					← Back
				</button>
				{#if data.user}
					<button class="btn btn-primary" onclick={saveToPortfolio} disabled={saving}>
						{#if saving}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							💾 Save to Portfolio
						{/if}
					</button>
				{:else}
					<button class="btn btn-primary" onclick={saveImage}>
						⬇️ Download
					</button>
				{/if}
				<button class="btn btn-secondary" onclick={saveToServerAndAddToCatalog}>
					📚 Add to Catalog
				</button>
				<button class="btn btn-success" onclick={createPaperDoll}>
					👗 Create Paper Doll
				</button>
			</div>
		</div>

		<!-- Auth Status Alert -->
		{#if !data.user}
			<div class="alert alert-info mb-6">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div>
					<h3 class="font-bold">Want to save your designs? 🎨</h3>
					<p class="text-sm">Sign up for free to save to your catalogs and access all features!</p>
				</div>
				<div class="flex-none">
					<a href="/auth/register" class="btn btn-sm btn-primary">Sign Up Free 🚀</a>
				</div>
			</div>
		{/if}

		<div class="grid lg:grid-cols-[300px_1fr] gap-6">
			<!-- Toolbar -->
			<div class="card bg-white shadow-xl">
				<div class="card-body">
					<h3 class="card-title text-xl mb-4">Tools</h3>

					<!-- Tool Selection -->
					<div class="grid grid-cols-2 gap-2 mb-6">
						<button
							class="btn"
							class:btn-primary={tool === 'brush'}
							class:btn-outline={tool !== 'brush'}
							onclick={() => (tool = 'brush')}
						>
							🖌️ Brush
						</button>
						<button
							class="btn"
							class:btn-primary={tool === 'spray'}
							class:btn-outline={tool !== 'spray'}
							onclick={() => (tool = 'spray')}
						>
							💨 Spray
						</button>
						<button
							class="btn"
							class:btn-primary={tool === 'glitter'}
							class:btn-outline={tool !== 'glitter'}
							onclick={() => (tool = 'glitter')}
						>
							✨ Glitter
						</button>
						<button
							class="btn"
							class:btn-primary={tool === 'stamp'}
							class:btn-outline={tool !== 'stamp'}
							onclick={() => (tool = 'stamp')}
						>
							🎨 Stamp
						</button>
						<button
							class="btn"
							class:btn-primary={tool === 'wand'}
							class:btn-outline={tool !== 'wand'}
							onclick={() => (tool = 'wand')}
							title="Click a color to remove it"
						>
							🪄 Wand
						</button>
						<button
							class="btn"
							class:btn-primary={tool === 'eraser'}
							class:btn-outline={tool !== 'eraser'}
							onclick={() => (tool = 'eraser')}
						>
							🧹 Eraser
						</button>
					</div>

					<!-- Brush Size -->
					<div class="mb-6">
						<label class="block text-sm font-semibold mb-2">
							Brush Size: {brushSize}px
						</label>
						<input
							type="range"
							min="2"
							max="50"
							bind:value={brushSize}
							class="range range-primary"
						/>
					</div>

					<!-- Color Palette -->
					<div class="mb-6">
						<label class="block text-sm font-semibold mb-2">Colors</label>
						<div class="grid grid-cols-4 gap-2">
							{#each colorPalette as color}
								<button
									class="w-12 h-12 rounded-lg border-4 transition-all hover:scale-110"
									class:border-black={brushColor === color}
									class:border-gray-300={brushColor !== color}
									style="background-color: {color}"
									onclick={() => {
										brushColor = color;
										tool = 'brush';
									}}
								/>
							{/each}
						</div>
					</div>

					<!-- Custom Color -->
					<div class="mb-6">
						<label class="block text-sm font-semibold mb-2">Custom Color</label>
						<input
							type="color"
							bind:value={brushColor}
							class="w-full h-12 rounded-lg cursor-pointer"
							onchange={() => (tool === 'eraser' ? (tool = 'brush') : null)}
						/>
					</div>

					<!-- Pattern Selection -->
					<div class="mb-6">
						<label class="block text-sm font-semibold mb-2">Patterns</label>
						<div class="grid grid-cols-3 gap-2">
							<button
								class="btn btn-sm"
								class:btn-primary={pattern === 'solid'}
								class:btn-outline={pattern !== 'solid'}
								onclick={() => (pattern = 'solid')}
							>
								Solid
							</button>
							<button
								class="btn btn-sm"
								class:btn-primary={pattern === 'dots'}
								class:btn-outline={pattern !== 'dots'}
								onclick={() => (pattern = 'dots')}
							>
								• Dots
							</button>
							<button
								class="btn btn-sm"
								class:btn-primary={pattern === 'stripes'}
								class:btn-outline={pattern !== 'stripes'}
								onclick={() => (pattern = 'stripes')}
							>
								≡ Stripes
							</button>
							<button
								class="btn btn-sm"
								class:btn-primary={pattern === 'stars'}
								class:btn-outline={pattern !== 'stars'}
								onclick={() => (pattern = 'stars')}
							>
								⭐ Stars
							</button>
							<button
								class="btn btn-sm"
								class:btn-primary={pattern === 'hearts'}
								class:btn-outline={pattern !== 'hearts'}
								onclick={() => (pattern = 'hearts')}
							>
								❤️ Hearts
							</button>
							<button
								class="btn btn-sm"
								class:btn-primary={pattern === 'sparkles'}
								class:btn-outline={pattern !== 'sparkles'}
								onclick={() => (pattern = 'sparkles')}
							>
								✨ Sparkle
							</button>
						</div>
						<p class="text-xs text-gray-500 mt-2">
							Use with Brush or Stamp tool
						</p>
					</div>

					<!-- Actions -->
					<div class="flex flex-col gap-2">
						<button class="btn btn-outline btn-error" onclick={clearCanvas}>
							🔄 Reset to Original
						</button>
					</div>
				</div>
			</div>

			<!-- Canvas Area -->
			<div class="card bg-white shadow-xl p-4">
				<div class="flex justify-center items-center">
					{#if imageUrl}
						<canvas
							bind:this={canvas}
							class="max-w-full h-auto border-2 border-gray-200 rounded-lg"
							class:cursor-crosshair={tool !== 'wand'}
							class:cursor-pointer={tool === 'wand'}
							onmousedown={startDrawing}
							onmousemove={draw}
							onmouseup={stopDrawing}
							onmouseleave={stopDrawing}
						/>
					{:else}
						<div class="text-center py-20">
							<p class="text-xl text-gray-500 mb-4">No image selected</p>
							<a href="/upload" class="btn btn-primary">
								← Go to Upload
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

{#if savedImageUrl}
	<AddToCatalogModal
		imageUrl={savedImageUrl}
		open={showCatalogModal}
		onclose={() => { showCatalogModal = false; }}
	/>
{/if}
