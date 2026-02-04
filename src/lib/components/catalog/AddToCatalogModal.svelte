<script lang="ts">
	let {
		imageUrl,
		open = false,
		onclose,
		onadded
	}: {
		imageUrl: string;
		open?: boolean;
		onclose?: () => void;
		onadded?: (catalogId: string) => void;
	} = $props();

	type CatalogSummary = {
		id: string;
		title: string;
		items?: { id: string; imageUrl: string }[];
	};

	let catalogs = $state<CatalogSummary[]>([]);
	let loading = $state(false);
	let creating = $state(false);
	let newTitle = $state('');
	let error = $state('');
	let adding = $state<string | null>(null);
	let success = $state<string | null>(null);

	$effect(() => {
		if (open) {
			loadCatalogs();
			success = null;
			error = '';
		}
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

	async function createAndAdd() {
		if (!newTitle.trim()) return;
		creating = true;
		error = '';
		try {
			const res = await fetch('/api/catalogs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: newTitle.trim() })
			});
			if (!res.ok) {
				const data = await res.json();
				error = data.error || 'Failed to create catalog';
				creating = false;
				return;
			}
			const catalog = await res.json();
			await addToCatalog(catalog.id);
			newTitle = '';
		} catch {
			error = 'Failed to create catalog';
		}
		creating = false;
	}

	async function addToCatalog(catalogId: string) {
		adding = catalogId;
		error = '';
		try {
			const res = await fetch(`/api/catalogs/${catalogId}/items`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ imageUrl })
			});
			if (!res.ok) {
				const data = await res.json();
				error = data.error || 'Failed to add to catalog';
				adding = null;
				return;
			}
			success = catalogId;
			onadded?.(catalogId);
		} catch {
			error = 'Failed to add to catalog';
		}
		adding = null;
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={onclose}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Add to Catalog</h3>
				<button class="btn btn-ghost btn-sm btn-circle" onclick={onclose}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			{#if success}
				<div class="success-state">
					<p class="success-icon">&#10024;</p>
					<p class="success-text">Added to catalog!</p>
					<div class="success-actions">
						<a href="/catalogs/{success}" class="btn btn-primary btn-sm">View Catalog</a>
						<button class="btn btn-ghost btn-sm" onclick={onclose}>Close</button>
					</div>
				</div>
			{:else}
				{#if error}
					<div class="alert alert-error text-sm mb-3">
						{error}
					</div>
				{/if}

				<!-- Create new -->
				<div class="create-section">
					<p class="section-label">Create New Catalog</p>
					<div class="create-form">
						<input
							type="text"
							class="input input-bordered input-sm flex-1"
							placeholder="Catalog name..."
							bind:value={newTitle}
							maxlength="200"
							onkeydown={(e) => { if (e.key === 'Enter') createAndAdd(); }}
						/>
						<button
							class="btn btn-primary btn-sm"
							disabled={!newTitle.trim() || creating}
							onclick={createAndAdd}
						>
							{creating ? 'Creating...' : 'Create & Add'}
						</button>
					</div>
				</div>

				<!-- Existing catalogs -->
				{#if loading}
					<div class="loading-state">
						<span class="loading loading-spinner"></span>
					</div>
				{:else if catalogs.length > 0}
					<div class="catalog-list">
						<p class="section-label">Or add to existing</p>
						{#each catalogs as catalog}
							<button
								class="catalog-row"
								disabled={adding === catalog.id}
								onclick={() => addToCatalog(catalog.id)}
							>
								<div class="catalog-thumb">
									{#if catalog.items && catalog.items.length > 0}
										<img src={catalog.items[0].imageUrl} alt="" />
									{:else}
										<span>&#x1f457;</span>
									{/if}
								</div>
								<div class="catalog-info">
									<span class="catalog-name">{catalog.title}</span>
									<span class="catalog-count">{catalog.items?.length || 0} items</span>
								</div>
								{#if adding === catalog.id}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<span class="add-icon">+</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		width: 100%;
		max-width: 420px;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.modal-header h3 {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.section-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.5rem;
	}

	.create-section {
		margin-bottom: 1.25rem;
	}

	.create-form {
		display: flex;
		gap: 0.5rem;
	}

	.catalog-list {
		border-top: 1px solid #f3f4f6;
		padding-top: 1rem;
	}

	.catalog-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem;
		border-radius: 8px;
		cursor: pointer;
		width: 100%;
		background: none;
		border: none;
		text-align: left;
		transition: background 0.1s;
	}

	.catalog-row:hover {
		background: #f9fafb;
	}

	.catalog-thumb {
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
		font-size: 1.25rem;
	}

	.catalog-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.catalog-info {
		flex: 1;
		min-width: 0;
	}

	.catalog-name {
		display: block;
		font-weight: 600;
		font-size: 0.95rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.catalog-count {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.add-icon {
		font-size: 1.25rem;
		font-weight: 700;
		color: #a855f7;
		flex-shrink: 0;
	}

	.loading-state {
		display: flex;
		justify-content: center;
		padding: 2rem;
	}

	.success-state {
		text-align: center;
		padding: 1.5rem 0;
	}

	.success-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.success-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: #374151;
		margin-bottom: 1rem;
	}

	.success-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}
</style>
