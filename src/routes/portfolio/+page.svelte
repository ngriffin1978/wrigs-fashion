<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let deleting = $state<string | null>(null);

	// Format date to relative time
	function formatDate(dateInput: string | Date): string {
		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return date.toLocaleDateString();
	}

	async function deleteDesign(designId: string, title: string) {
		const confirmed = confirm(`Are you sure you want to delete "${title}"? This cannot be undone! 🗑️`);
		if (!confirmed) return;

		deleting = designId;
		try {
			const res = await fetch(`/api/designs/${designId}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				// Reload the page to refresh the designs list
				location.reload();
			} else {
				alert('Failed to delete design. Try again! 😅');
			}
		} catch (error) {
			console.error('Delete error:', error);
			alert('Something went wrong! 😅');
		} finally {
			deleting = null;
		}
	}

	function downloadImage(url: string, filename: string) {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
	}
</script>

<svelte:head>
	<title>My Portfolio - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 pb-12">
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-3xl font-bold text-gray-800">My Portfolio 📁</h2>
		<div class="flex gap-2">
			<button class="btn btn-outline">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 10h16M4 14h16M4 18h16"
					/>
				</svg>
				Grid
			</button>
			<button class="btn btn-outline">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
				List
			</button>
		</div>
	</div>

	<!-- Portfolio Grid -->
	{#if data.designs.length === 0}
		<!-- Empty State -->
		<div class="col-span-full text-center py-16">
			<div class="text-6xl mb-4">🎨</div>
			<h3 class="text-2xl font-bold text-gray-800 mb-2">Your portfolio is empty!</h3>
			<p class="text-gray-600 mb-6">Start creating amazing fashion designs to fill it up! ✨</p>
			<a href="/upload" class="btn btn-primary btn-lg">
				Create Your First Design 🚀
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each data.designs as design}
				<div class="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
					<figure class="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
						{#if design.cleanedImageUrl}
							<img
								src={design.cleanedImageUrl}
								alt={design.title}
								class="w-full h-full object-contain"
							/>
						{:else if design.originalImageUrl}
							<img
								src={design.originalImageUrl}
								alt={design.title}
								class="w-full h-full object-contain"
							/>
						{:else}
							<span class="text-6xl">🎨</span>
						{/if}
					</figure>
					<div class="card-body">
						<h3 class="card-title text-lg truncate">{design.title}</h3>
						<p class="text-sm text-gray-500">Created {formatDate(design.createdAt)}</p>
						<div class="card-actions justify-end items-center mt-2">
							<div class="dropdown dropdown-end">
								<label tabindex="0" class="btn btn-ghost btn-circle btn-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
										/>
									</svg>
								</label>
								<ul
									tabindex="0"
									class="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-box w-52"
								>
									<li>
										<button
											onclick={() =>
												goto(`/editor?imageUrl=${encodeURIComponent(design.cleanedImageUrl || design.originalImageUrl || '')}`)}
										>
											✏️ Edit
										</button>
									</li>
									<li>
										<button
											onclick={() =>
												goto(`/doll-builder?designId=${design.id}&imageUrl=${encodeURIComponent(design.cleanedImageUrl || design.originalImageUrl || '')}`)}
										>
											👗 Make Paper Doll
										</button>
									</li>
									{#if design.cleanedImageUrl}
										<li>
											<button
												onclick={() =>
													downloadImage(
														design.cleanedImageUrl!,
														`${design.title}.png`
													)}
											>
												⬇️ Download
											</button>
										</li>
									{/if}
									<li>
										<button
											class="text-error"
											onclick={() => deleteDesign(design.id, design.title)}
											disabled={deleting === design.id}
										>
											{#if deleting === design.id}
												<span class="loading loading-spinner loading-xs"></span>
												Deleting...
											{:else}
												🗑️ Delete
											{/if}
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			{/each}

			<!-- New Design Card -->
			<a
				href="/upload"
				class="card bg-white shadow-xl border-4 border-dashed border-primary hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
			>
				<figure class="aspect-square flex items-center justify-center">
					<div>
						<button class="btn btn-circle btn-lg btn-primary mb-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-8 w-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</button>
						<p class="text-center font-bold text-gray-500">Create New</p>
					</div>
				</figure>
			</a>
		</div>
	{/if}

	<!-- Stats -->
	{#if data.designs.length > 0}
		<div class="stats stats-vertical lg:stats-horizontal shadow-xl bg-white mt-12 w-full">
			<div class="stat">
				<div class="stat-figure text-primary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div class="stat-title">Total Designs</div>
				<div class="stat-value text-primary">{data.designs.length}</div>
				<div class="stat-desc">
					{#if data.designs.length === 1}
						Great start! ✨
					{:else if data.designs.length < 5}
						Keep creating! ✨
					{:else if data.designs.length < 10}
						You're on fire! 🔥
					{:else}
						Amazing portfolio! 🌟
					{/if}
				</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div class="stat-title">Latest Design</div>
				<div class="stat-value text-secondary text-lg">{formatDate(data.designs[0].createdAt)}</div>
				<div class="stat-desc">Keep the creativity flowing!</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-accent">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div class="stat-title">Achievement</div>
				<div class="stat-value text-accent text-2xl">
					{#if data.designs.length >= 20}
						Master Designer 👑
					{:else if data.designs.length >= 10}
						Fashion Pro ⭐
					{:else if data.designs.length >= 5}
						Rising Star 🌟
					{:else}
						Creative Explorer 🎨
					{/if}
				</div>
				<div class="stat-desc">You're amazing!</div>
			</div>
		</div>
	{/if}
</div>
