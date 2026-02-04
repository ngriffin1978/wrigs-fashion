<script lang="ts">
	import CatalogCanvas from '$lib/components/catalog/CatalogCanvas.svelte';
	import type { CatalogItemData } from '$lib/components/catalog/CatalogItem.svelte';

	let { data } = $props();

	let items: CatalogItemData[] = $derived(data.items);
</script>

<svelte:head>
	<title>{data.catalog.title} - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-6xl">
	<div class="shared-header">
		<h1 class="text-2xl font-bold">{data.catalog.title}</h1>
		<p class="text-sm text-gray-500">Shared fashion catalog</p>
	</div>

	<CatalogCanvas
		{items}
		backgroundColor={data.catalog.backgroundColor}
		readonly={true}
	/>

	<div class="cta-section">
		<a href="/upload" class="btn btn-primary">Create Your Own!</a>
	</div>
</div>

<style>
	.shared-header {
		text-align: center;
		margin-bottom: 1rem;
	}

	.cta-section {
		text-align: center;
		margin-top: 1.5rem;
	}
</style>
