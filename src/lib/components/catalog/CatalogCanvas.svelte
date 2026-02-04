<script lang="ts">
	import CatalogItem, { type CatalogItemData } from './CatalogItem.svelte';

	let {
		items = [],
		readonly = false,
		backgroundColor = '#ffffff',
		onitemschange
	}: {
		items?: CatalogItemData[];
		readonly?: boolean;
		backgroundColor?: string;
		onitemschange?: (items: CatalogItemData[]) => void;
	} = $props();

	let selectedId = $state<string | null>(null);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	function scheduleAutosave() {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			onitemschange?.(items);
		}, 500);
	}

	function selectItem(id: string) {
		selectedId = id;
	}

	function deselectAll() {
		selectedId = null;
	}

	function updateItem(id: string, updates: Partial<CatalogItemData>) {
		const idx = items.findIndex((i) => i.id === id);
		if (idx === -1) return;
		items[idx] = { ...items[idx], ...updates };
		items = items; // trigger reactivity
		scheduleAutosave();
	}

	function deleteItem(id: string) {
		items = items.filter((i) => i.id !== id);
		selectedId = null;
		onitemschange?.(items);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
			deleteItem(selectedId);
		}
		if (e.key === 'Escape') {
			deselectAll();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="catalog-canvas"
	style="background-color: {backgroundColor};"
	onclick={deselectAll}
>
	{#if items.length === 0 && !readonly}
		<div class="empty-state">
			<p class="empty-icon">&#x1f457;</p>
			<p class="empty-title">Your catalog is empty!</p>
			<p class="empty-text">Upload a design and add it here to get started.</p>
			<a href="/upload" class="btn btn-primary btn-sm mt-2">Upload a Design</a>
		</div>
	{/if}

	{#each items as item (item.id)}
		<CatalogItem
			{item}
			selected={selectedId === item.id}
			{readonly}
			onselect={() => selectItem(item.id)}
			onupdate={(updates) => updateItem(item.id, updates)}
			ondelete={() => deleteItem(item.id)}
		/>
	{/each}
</div>

<style>
	.catalog-canvas {
		position: relative;
		width: 100%;
		height: 800px;
		border-radius: 12px;
		border: 2px dashed #e5e7eb;
		overflow: hidden;
		user-select: none;
	}

	@media (max-width: 768px) {
		.catalog-canvas {
			height: 600px;
		}
	}

	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: #9ca3af;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 0.5rem;
	}

	.empty-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		color: #6b7280;
	}

	.empty-text {
		font-size: 0.95rem;
	}
</style>
