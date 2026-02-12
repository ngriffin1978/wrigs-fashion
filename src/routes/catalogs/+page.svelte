<script lang="ts">
	import { onMount } from 'svelte';

	type CatalogSummary = {
		id: string;
		title: string;
		backgroundColor: string;
		createdAt: string;
		items?: { id: string; imageUrl: string }[];
	};

	let catalogs = $state<CatalogSummary[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let error = $state('');

	onMount(async () => {
		await loadCatalogs();
	});

	async function loadCatalogs() {
		loading = true;
		try {
			const res = await fetch('/api/catalogs');
			if (res.ok) {
				catalogs = await res.json();
			}
		} catch {
			error = 'Failed to load catalogs';
		}
		loading = false;
	}

	async function createCatalog() {
		creating = true;
		error = '';
		try {
			const res = await fetch('/api/catalogs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'My Fashion Catalog' })
			});
			if (res.ok) {
				const catalog = await res.json();

				// Wait for browser to process cookies from response before navigating
				await new Promise(resolve => setTimeout(resolve, 100));
				window.location.href = `/catalogs/${catalog.id}`;
			} else {
				const data = await res.json();
				error = data.error || 'Failed to create catalog';
			}
		} catch {
			error = 'Failed to create catalog';
		}
		creating = false;
	}

	async function deleteCatalog(id: string, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (!confirm('Delete this catalog? This cannot be undone.')) return;
		try {
			await fetch(`/api/catalogs/${id}`, { method: 'DELETE' });
			catalogs = catalogs.filter((c) => c.id !== id);
		} catch {
			error = 'Failed to delete catalog';
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Catalogs - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-5xl">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">
			<span class="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
				My Catalogs
			</span>
		</h1>
		<button class="btn btn-primary" onclick={createCatalog} disabled={creating}>
			{creating ? 'Creating...' : '+ New Catalog'}
		</button>
	</div>

	{#if error}
		<div class="alert alert-error mb-4">{error}</div>
	{/if}

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if catalogs.length === 0}
		<div class="card bg-white shadow-xl">
			<div class="card-body items-center text-center py-16">
				<p style="font-size: 4rem;">&#x1f4da;</p>
				<h2 class="card-title text-2xl">No catalogs yet!</h2>
				<p class="text-gray-500 max-w-md">
					Create a catalog to collect your fashion designs on a canvas. Drag, resize, and arrange them however you like!
				</p>
				<button class="btn btn-primary mt-4" onclick={createCatalog} disabled={creating}>
					Create Your First Catalog
				</button>
			</div>
		</div>
	{:else}
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each catalogs as catalog}
				<a href="/catalogs/{catalog.id}" class="catalog-card card bg-white shadow-lg hover:shadow-xl transition-shadow">
					<div
						class="card-preview"
						style="background-color: {catalog.backgroundColor};"
					>
						{#if catalog.items && catalog.items.length > 0}
							<div class="preview-grid">
								{#each catalog.items.slice(0, 4) as item}
									<img src={item.imageUrl} alt="" class="preview-img" />
								{/each}
							</div>
						{:else}
							<div class="preview-empty">
								<span style="font-size: 2.5rem;">&#x1f457;</span>
							</div>
						{/if}
					</div>
					<div class="card-body p-4">
						<h3 class="font-bold text-lg truncate">{catalog.title}</h3>
						<div class="flex justify-between items-center text-sm text-gray-500">
							<span>{catalog.items?.length || 0} designs</span>
							<span>{formatDate(catalog.createdAt)}</span>
						</div>
						<button
							class="btn btn-ghost btn-xs text-error mt-1 self-end"
							onclick={(e) => deleteCatalog(catalog.id, e)}
						>
							Delete
						</button>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.catalog-card {
		text-decoration: none;
		color: inherit;
		overflow: hidden;
		border-radius: 12px;
	}

	.card-preview {
		height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		padding: 8px;
		width: 100%;
		height: 100%;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 4px;
	}

	.preview-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		opacity: 0.3;
	}
</style>
