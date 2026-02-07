<script lang="ts">
	import ReactionBar from './ReactionBar.svelte';
	import ComplimentsList from './ComplimentsList.svelte';

	interface Props {
		item: any;
		circleId: string;
	}

	let { item, circleId }: Props = $props();

	function formatDate(dateInput: string | Date): string {
		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}

	// Get the appropriate image to display
	let imageUrl = $derived.by(() => {
		if (item.design) {
			return item.design.cleanedImageUrl || item.design.originalImageUrl;
		}
		if (item.dollProject?.design) {
			return item.dollProject.design.cleanedImageUrl || item.dollProject.design.originalImageUrl;
		}
		return null;
	});

	let title = $derived.by(() => {
		if (item.design) return item.design.title;
		if (item.dollProject) return `Paper Doll - ${item.dollProject.design?.title || 'Untitled'}`;
		return 'Untitled';
	});

	let isPdf = $derived(item.itemType === 'dollProject');
</script>

<div class="card bg-white shadow-xl">
	<div class="card-body">
		<!-- Sharer Info -->
		<div class="flex items-center gap-2 mb-2">
			<div class="avatar placeholder">
				<div class="bg-primary text-primary-content rounded-full w-10">
					<span class="text-sm">{item.sharedByUser?.name?.[0] || '?'}</span>
				</div>
			</div>
			<div>
				<p class="font-semibold">{item.sharedByUser?.name || 'Unknown'}</p>
				<p class="text-xs text-gray-500">
					shared {item.itemType === 'design' ? 'a design' : 'a paper doll'} • {formatDate(
						item.createdAt
					)}
				</p>
			</div>
		</div>

		<!-- Content -->
		<div class="grid md:grid-cols-2 gap-4 mt-4">
			<!-- Image Preview -->
			<div class="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
				{#if imageUrl}
					<img src={imageUrl} alt={title} class="w-full h-full object-contain" />
				{:else}
					<span class="text-6xl">{isPdf ? '📄' : '🎨'}</span>
				{/if}
			</div>

			<!-- Details -->
			<div>
				<h3 class="font-bold text-xl mb-2">{title}</h3>

				{#if isPdf}
					<div class="badge badge-secondary mb-2">Paper Doll</div>
				{:else}
					<div class="badge badge-primary mb-2">Design</div>
				{/if}

				{#if item.dollProject?.pdfUrl}
					<a
						href={item.dollProject.pdfUrl}
						download
						class="btn btn-sm btn-outline mt-2"
						target="_blank"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Download PDF
					</a>
				{/if}

				<!-- Reactions -->
				<div class="mt-4">
					<ReactionBar sharedItemId={item.id} />
				</div>
			</div>
		</div>

		<!-- Compliments -->
		<div class="mt-4 pt-4 border-t">
			<ComplimentsList sharedItemId={item.id} />
		</div>
	</div>
</div>
