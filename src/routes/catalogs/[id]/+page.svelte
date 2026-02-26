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
	let comments = $state<any[]>([]);
	let commentsLoading = $state(false);
	let commentsError = $state('');
	let newComment = $state('');
	let replyDrafts = $state<Record<string, string>>({});

	onMount(async () => {
		await loadCatalog();
		await loadComments();
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

	const rootComments = $derived(comments.filter((c) => !c.parentId));
	const repliesFor = (parentId: string) => comments.filter((c) => c.parentId === parentId);

	async function loadComments() {
		commentsLoading = true;
		commentsError = '';
		try {
			const res = await fetch(`/api/catalogs/${catalogId}/comments`);
			const data = await res.json();
			comments = data.comments || [];
		} catch {
			commentsError = 'Failed to load comments';
		} finally {
			commentsLoading = false;
		}
	}

	async function submitComment(parentId: string | null = null) {
		const draft = parentId ? (replyDrafts[parentId] || '') : newComment;
		if (!draft.trim()) return;
		try {
			const res = await fetch(`/api/catalogs/${catalogId}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: draft, parentId })
			});
			if (!res.ok) return;
			if (parentId) {
				replyDrafts = { ...replyDrafts, [parentId]: '' };
			} else {
				newComment = '';
			}
			await loadComments();
		} catch {
			// no-op for now
		}
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

		<div class="card bg-white shadow-xl mt-6">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<h3 class="card-title">Catalog Discussion</h3>
					<button class="btn btn-ghost btn-xs" onclick={loadComments}>Refresh</button>
				</div>

				<div class="space-y-2 mb-4">
					<textarea class="textarea textarea-bordered w-full" rows="3" bind:value={newComment} placeholder="Share a thought about this catalog..."></textarea>
					<div class="flex justify-end">
						<button class="btn btn-primary btn-sm" onclick={() => submitComment(null)}>Post Comment</button>
					</div>
				</div>

				{#if commentsLoading}
					<div class="text-sm opacity-70">Loading comments...</div>
				{:else if commentsError}
					<div class="text-sm text-error">{commentsError}</div>
				{:else if rootComments.length === 0}
					<div class="text-sm opacity-70">No comments yet. Start the conversation.</div>
				{:else}
					<div class="space-y-4">
						{#each rootComments as comment}
							<div class="rounded-lg border border-base-300 p-3">
								<div class="text-sm font-semibold">{comment.author}</div>
								<div class="text-xs opacity-60">{new Date(comment.createdAt).toLocaleString()}</div>
								<p class="mt-2 whitespace-pre-wrap">{comment.message}</p>

								<div class="mt-3 ml-3 space-y-2">
									{#each repliesFor(comment.id) as reply}
										<div class="rounded border border-base-200 p-2 bg-base-100">
											<div class="text-xs font-semibold">{reply.author}</div>
											<div class="text-[10px] opacity-60">{new Date(reply.createdAt).toLocaleString()}</div>
											<p class="text-sm mt-1 whitespace-pre-wrap">{reply.message}</p>
										</div>
									{/each}
								</div>

								<div class="mt-3">
									<textarea class="textarea textarea-bordered w-full textarea-sm" rows="2" bind:value={replyDrafts[comment.id]} placeholder="Write a reply..."></textarea>
									<div class="flex justify-end mt-1">
										<button class="btn btn-ghost btn-xs" onclick={() => submitComment(comment.id)}>Reply</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
