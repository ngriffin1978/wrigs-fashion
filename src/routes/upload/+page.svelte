<script lang="ts">
	import AddToCatalogModal from '$lib/components/catalog/AddToCatalogModal.svelte';

	let selectedFile: File | null = $state(null);
	let previewUrl: string | null = $state(null);
	let isDragging: boolean = $state(false);
	let error: string | null = $state(null);
	let isUploading: boolean = $state(false);
	let uploadResult: any = $state(null);
	let showCatalogModal = $state(false);
	let showCropTool: boolean = $state(false);
	let cropCanvas: HTMLCanvasElement | undefined = $state();
	let cropCtx: CanvasRenderingContext2D | null = null;
	let cropImage: HTMLImageElement | null = null;
	let isDrawingSelection = $state(false);
	let selectionPath: { x: number; y: number }[] = $state([]);

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic'];

	function validateFile(file: File): string | null {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return 'Please upload a JPG, PNG, or HEIC image';
		}
		if (file.size > MAX_FILE_SIZE) {
			return 'File size must be less than 10MB';
		}
		return null;
	}

	function handleFile(file: File) {
		error = null;
		uploadResult = null;
		showCropTool = false;
		const validationError = validateFile(file);

		if (validationError) {
			error = validationError;
			selectedFile = null;
			previewUrl = null;
			return;
		}

		selectedFile = file;

		// Create preview
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = URL.createObjectURL(file);

		// Show crop tool
		showCropTool = true;

		// Load image for cropping
		setTimeout(() => {
			if (cropCanvas && previewUrl) {
				loadCropImage(previewUrl);
			}
		}, 100);
	}

	function loadCropImage(url: string) {
		const img = new Image();
		img.onload = () => {
			cropImage = img;
			if (cropCanvas) {
				cropCanvas.width = img.width;
				cropCanvas.height = img.height;
				cropCtx = cropCanvas.getContext('2d');
				selectionPath = [];
				drawCropCanvas();
			}
		};
		img.src = url;
	}

	function drawCropCanvas() {
		if (!cropCtx || !cropImage || !cropCanvas) return;

		// Clear canvas
		cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

		// Draw image
		cropCtx.drawImage(cropImage, 0, 0);

		// If there's a selection path, draw it
		if (selectionPath.length > 0) {
			// Draw the selection line
			cropCtx.strokeStyle = '#3B82F6';
			cropCtx.lineWidth = 4;
			cropCtx.lineCap = 'round';
			cropCtx.lineJoin = 'round';
			cropCtx.setLineDash([10, 5]);

			cropCtx.beginPath();
			cropCtx.moveTo(selectionPath[0].x, selectionPath[0].y);
			for (let i = 1; i < selectionPath.length; i++) {
				cropCtx.lineTo(selectionPath[i].x, selectionPath[i].y);
			}
			cropCtx.stroke();
			cropCtx.setLineDash([]);

			// If selection is closed (complete), fill outside with overlay
			if (selectionPath.length > 10) {
				cropCtx.save();

				// Create clipping path from selection
				cropCtx.beginPath();
				cropCtx.moveTo(selectionPath[0].x, selectionPath[0].y);
				for (let i = 1; i < selectionPath.length; i++) {
					cropCtx.lineTo(selectionPath[i].x, selectionPath[i].y);
				}
				cropCtx.closePath();
				cropCtx.clip();

				// Fill outside with dark overlay (inverted clip)
				cropCtx.globalCompositeOperation = 'destination-over';
				cropCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
				cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

				cropCtx.restore();
			}
		}
	}

	function startDrawingSelection(e: MouseEvent) {
		if (!cropCanvas) return;
		isDrawingSelection = true;
		selectionPath = [];

		const rect = cropCanvas.getBoundingClientRect();
		const x = ((e.clientX - rect.left) * cropCanvas.width) / rect.width;
		const y = ((e.clientY - rect.top) * cropCanvas.height) / rect.height;

		selectionPath.push({ x, y });
		drawCropCanvas();
	}

	function continueDrawingSelection(e: MouseEvent) {
		if (!isDrawingSelection || !cropCanvas) return;

		const rect = cropCanvas.getBoundingClientRect();
		const x = ((e.clientX - rect.left) * cropCanvas.width) / rect.width;
		const y = ((e.clientY - rect.top) * cropCanvas.height) / rect.height;

		selectionPath.push({ x, y });
		drawCropCanvas();
	}

	function stopDrawingSelection() {
		isDrawingSelection = false;
		drawCropCanvas();
	}

	function clearSelection() {
		selectionPath = [];
		drawCropCanvas();
	}

	async function applyCrop() {
		if (!cropCanvas || !cropImage || selectionPath.length < 3) {
			alert('Please draw a selection around your drawing first!');
			return;
		}

		// Find bounding box of selection
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		selectionPath.forEach((point) => {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
		});

		const width = maxX - minX;
		const height = maxY - minY;

		// Create a new canvas for the cropped area
		const croppedCanvas = document.createElement('canvas');
		croppedCanvas.width = width;
		croppedCanvas.height = height;
		const croppedCtx = croppedCanvas.getContext('2d');

		if (croppedCtx) {
			// Create clipping path from selection (adjusted to new canvas coords)
			croppedCtx.beginPath();
			croppedCtx.moveTo(selectionPath[0].x - minX, selectionPath[0].y - minY);
			for (let i = 1; i < selectionPath.length; i++) {
				croppedCtx.lineTo(selectionPath[i].x - minX, selectionPath[i].y - minY);
			}
			croppedCtx.closePath();
			croppedCtx.clip();

			// Draw the cropped portion
			croppedCtx.drawImage(cropImage, -minX, -minY);

			// Convert to blob
			croppedCanvas.toBlob((blob) => {
				if (blob) {
					// Create new file from cropped image
					const croppedFile = new File([blob], selectedFile?.name || 'cropped.png', {
						type: 'image/png'
					});
					selectedFile = croppedFile;

					// Update preview
					if (previewUrl) {
						URL.revokeObjectURL(previewUrl);
					}
					previewUrl = URL.createObjectURL(blob);
					showCropTool = false;
				}
			}, 'image/png');
		}
	}

	function skipCrop() {
		showCropTool = false;
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFile(target.files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer?.files;
		if (files && files[0]) {
			handleFile(files[0]);
		}
	}

	async function handleUpload() {
		if (!selectedFile) return;

		isUploading = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('file', selectedFile);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				// Show detailed error message if available
				const errorMessage = data.details
					? `${data.error}: ${data.details}`
					: data.error || 'Upload failed';
				console.error('Upload error:', data);
				throw new Error(errorMessage);
			}

			uploadResult = data;
		} catch (err) {
			console.error('Upload exception:', err);
			error = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			isUploading = false;
		}
	}
</script>

<svelte:head>
	<title>Upload Your Drawing - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 pb-12">
	<div class="max-w-2xl mx-auto">
		<div class="card bg-white shadow-2xl">
			<div class="card-body">
				<h2 class="card-title text-3xl mb-6 justify-center">Upload Your Drawing 📸</h2>

				<!-- Upload Zone -->
				<label
					for="file-upload"
					class="border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer block
						{isDragging
						? 'border-secondary bg-secondary/20 scale-105'
						: 'border-primary hover:bg-primary/5'}"
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
				>
					<div class="mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-24 w-24 mx-auto text-primary"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
					</div>
					<h3 class="text-2xl font-bold mb-2">
						{isDragging ? 'Drop it here! 🎨' : 'Drop your drawing here!'}
					</h3>
					<p class="text-gray-500 mb-4">or click to browse</p>
					<span class="btn btn-primary btn-lg">Choose File</span>
					<p class="text-sm text-gray-400 mt-4">JPG, PNG or HEIC • Max 10MB</p>
					<input
						id="file-upload"
						type="file"
						class="hidden"
						accept="image/jpeg,image/png,image/heic"
						onchange={handleFileSelect}
					/>
				</label>

				<!-- Error Message -->
				{#if error}
					<div class="mt-4">
						<div class="alert alert-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{error}</span>
						</div>
					</div>
				{/if}

				<!-- Crop Tool -->
				{#if showCropTool && previewUrl}
					<div class="mt-6">
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h3 class="card-title">✂️ Circle Your Drawing</h3>
								<p class="text-sm text-gray-600 mb-4">
									<strong>Click and drag</strong> to draw a circle around the part you want to keep
								</p>

								<div class="flex justify-center">
									<canvas
										bind:this={cropCanvas}
										class="max-w-full h-auto border-2 border-gray-300 rounded-lg cursor-crosshair"
										onmousedown={startDrawingSelection}
										onmousemove={continueDrawingSelection}
										onmouseup={stopDrawingSelection}
										onmouseleave={stopDrawingSelection}
									/>
								</div>

								<div class="flex gap-2 justify-center mt-4">
									<button class="btn btn-outline btn-sm" onclick={clearSelection}>
										🔄 Clear Selection
									</button>
									<button class="btn btn-outline" onclick={skipCrop}>
										Skip
									</button>
									<button class="btn btn-primary" onclick={applyCrop}>
										✂️ Crop & Continue
									</button>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Image Preview -->
				{#if selectedFile && previewUrl && !showCropTool}
					<div class="mt-6">
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Preview</h3>
								<div class="relative">
									<img
										src={previewUrl}
										alt="Preview of {selectedFile.name}"
										class="w-full h-auto rounded-xl max-h-96 object-contain bg-gray-50"
									/>
								</div>
								<div class="flex justify-between items-center mt-4">
									<div class="text-sm">
										<p class="font-semibold">{selectedFile.name}</p>
										<p class="text-gray-500">
											{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
									<button
										class="btn btn-sm btn-ghost"
										onclick={() => {
											selectedFile = null;
											if (previewUrl) {
												URL.revokeObjectURL(previewUrl);
												previewUrl = null;
											}
										}}
									>
										Remove
									</button>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Info Alert -->
				<div class="mt-8">
					<div class="alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-current shrink-0 w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Take a clear photo with good lighting for best results!</span>
					</div>
				</div>

				<!-- Upload Results -->
				{#if uploadResult}
					<div class="mt-8">
						<div class="card bg-gradient-to-br from-success/10 to-primary/10 shadow-xl">
							<div class="card-body">
								<h3 class="card-title text-2xl">✨ Your Drawing is Ready!</h3>
								<p class="text-gray-600 mb-4">
									We've cleaned up your sketch and made it ready for coloring!
								</p>

								<div class="grid md:grid-cols-2 gap-4">
									<!-- Original -->
									<div>
										<h4 class="font-bold mb-2 text-center">Original</h4>
										<img
											src={uploadResult.originalUrl}
											alt="Original"
											class="w-full rounded-xl shadow-lg bg-white"
										/>
									</div>

									<!-- Cleaned -->
									<div>
										<h4 class="font-bold mb-2 text-center">Cleaned ✨</h4>
										<img
											src={uploadResult.cleanedUrl}
											alt="Cleaned"
											class="w-full rounded-xl shadow-lg bg-white"
										/>
									</div>
								</div>

								<div class="card-actions justify-center mt-6 flex-wrap">
									<a
										href="/editor?image={encodeURIComponent(uploadResult.cleanedUrl)}"
										class="btn btn-primary btn-lg"
									>
										Paint & Modify 🎨
									</a>
									<button
										class="btn btn-secondary btn-lg"
										onclick={() => { showCatalogModal = true; }}
									>
										Add to Catalog 📚
									</button>
									<button
										class="btn btn-outline btn-lg"
										onclick={() => {
											uploadResult = null;
											selectedFile = null;
											if (previewUrl) {
												URL.revokeObjectURL(previewUrl);
												previewUrl = null;
											}
										}}
									>
										Upload Another
									</button>
								</div>
							</div>
						</div>
					</div>
				{:else if !showCropTool}
					<div class="card-actions justify-center mt-8">
						<a href="/" class="btn btn-outline btn-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							Back
						</a>
						<button
							class="btn btn-primary btn-lg"
							disabled={!selectedFile || isUploading}
							onclick={handleUpload}
						>
							{#if isUploading}
								<span class="loading loading-spinner"></span>
								Processing...
							{:else}
								Process Drawing
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if uploadResult}
	<AddToCatalogModal
		imageUrl={uploadResult.cleanedUrl}
		open={showCatalogModal}
		onclose={() => { showCatalogModal = false; }}
	/>
{/if}
