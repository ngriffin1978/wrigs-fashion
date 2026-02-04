<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import CatalogCanvas from '$lib/components/catalog/CatalogCanvas.svelte';
	import CatalogToolbar from '$lib/components/catalog/CatalogToolbar.svelte';
	import CatalogShareModal from '$lib/components/catalog/CatalogShareModal.svelte';
	import type { CatalogItemData } from '$lib/components/catalog/CatalogItem.svelte';

	let catalogId = $derived($page.params.id ?? '');
	let title = $state('My Fashion Catalog');
	let backgroundColor = $state('#ffffff');
	let isPublic = $state(false);
	let shareSlug = $state('');
	let items = $state<CatalogItemData[]>([]);
	let loading = $state(true);
	let error = $state('');
	let saveStatus = $state<'saved' | 'saving' | 'error'>('saved');
	let shareModalOpen = $state(false);

	onMount(async () => {
		await loadCatalog();
	});

	async function loadCatalog() {
		loading = true;
		try {
			const res = await fetch(`/api/catalogs/${catalogId}`);
			if (!res.ok) {
				error = 'Catalog not found';
				loading = false;
				return;
			}
			const data = await res.json();
			title = data.title;
			backgroundColor = data.backgroundColor;
			isPublic = data.isPublic;
			shareSlug = data.shareSlug || '';
			items = (data.items || []).map((i: any) => ({
				id: i.id,
				imageUrl: i.imageUrl,
				positionX: i.positionX,
				positionY: i.positionY,
				width: i.width,
				height: i.height,
				rotation: i.rotation,
				zIndex: i.zIndex
			}));
		} catch {
			error = 'Failed to load catalog';
		}
		loading = false;
	}

	async function handleItemsChange(updatedItems: CatalogItemData[]) {
		saveStatus = 'saving';
		try {
			// Batch update all items
			const promises = updatedItems.map((item) =>
				fetch(`/api/catalogs/${catalogId}/items/${item.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						positionX: item.positionX,
						positionY: item.positionY,
						width: item.width,
						height: item.height,
						rotation: item.rotation,
						zIndex: item.zIndex
					})
				})
			);
			await Promise.all(promises);
			saveStatus = 'saved';
		} catch {
			saveStatus = 'error';
		}
	}

	async function handleTitleChange(newTitle: string) {
		title = newTitle;
		saveStatus = 'saving';
		try {
			const res = await fetch(`/api/catalogs/${catalogId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: newTitle })
			});
			saveStatus = res.ok ? 'saved' : 'error';
		} catch {
			saveStatus = 'error';
		}
	}

	async function handleBgChange(color: string) {
		backgroundColor = color;
		saveStatus = 'saving';
		try {
			const res = await fetch(`/api/catalogs/${catalogId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ backgroundColor: color })
			});
			saveStatus = res.ok ? 'saved' : 'error';
		} catch {
			saveStatus = 'error';
		}
	}

	function handleShareToggle(newPublic: boolean, newSlug: string) {
		isPublic = newPublic;
		shareSlug = newSlug;
	}
</script>

<svelte:head>
	<title>{title} - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-6xl">
	{#if loading}
		<div class="flex justify-center py-20">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
		<div class="card bg-white shadow-xl">
			<div class="card-body items-center text-center py-16">
				<p style="font-size: 3rem;">&#x1f61e;</p>
				<h2 class="card-title">{error}</h2>
				<a href="/catalogs" class="btn btn-primary mt-4">Back to Catalogs</a>
			</div>
		</div>
	{:else}
		<CatalogToolbar
			{title}
			{backgroundColor}
			{saveStatus}
			ontitlechange={handleTitleChange}
			onbgchange={handleBgChange}
			onshare={() => { shareModalOpen = true; }}
			onback={() => { window.location.href = '/catalogs'; }}
		/>

		<CatalogCanvas
			{items}
			{backgroundColor}
			onitemschange={handleItemsChange}
		/>

		<CatalogShareModal
			{catalogId}
			{isPublic}
			{shareSlug}
			open={shareModalOpen}
			onclose={() => { shareModalOpen = false; }}
			ontoggle={handleShareToggle}
		/>
	{/if}
</div>
