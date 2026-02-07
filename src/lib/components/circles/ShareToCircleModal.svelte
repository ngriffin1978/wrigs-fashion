<script lang="ts">
	interface Props {
		itemType: 'design' | 'dollProject';
		itemId: string;
		onclose: () => void;
	}

	let { itemType, itemId, onclose }: Props = $props();

	let circles = $state<any[]>([]);
	let selectedCircleIds = $state<string[]>([]);
	let loading = $state(true);
	let sharing = $state(false);
	let error = $state('');
	let success = $state(false);

	// Load circles on mount
	$effect(() => {
		loadCircles();
	});

	async function loadCircles() {
		loading = true;
		try {
			const res = await fetch('/api/circles');
			if (res.ok) {
				const data = await res.json();
				circles = data.circles || [];
			}
		} catch (err) {
			console.error('Failed to load circles:', err);
			error = 'Failed to load circles';
		} finally {
			loading = false;
		}
	}

	function toggleCircle(circleId: string) {
		if (selectedCircleIds.includes(circleId)) {
			selectedCircleIds = selectedCircleIds.filter((id) => id !== circleId);
		} else {
			selectedCircleIds = [...selectedCircleIds, circleId];
		}
	}

	async function handleShare() {
		if (selectedCircleIds.length === 0) {
			error = 'Please select at least one circle';
			return;
		}

		sharing = true;
		error = '';

		try {
			const res = await fetch('/api/share', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					itemType,
					itemId,
					circleIds: selectedCircleIds
				})
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to share');
			}

			success = true;
			setTimeout(() => {
				onclose();
			}, 1500);
		} catch (err: any) {
			error = err.message || 'Failed to share';
		} finally {
			sharing = false;
		}
	}
</script>

<div class="modal modal-open">
	<div class="modal-box max-w-2xl">
		{#if success}
			<div class="text-center py-8">
				<div class="text-6xl mb-4">✨</div>
				<h3 class="font-bold text-2xl mb-2">Shared!</h3>
				<p class="text-gray-600">Your {itemType === 'design' ? 'design' : 'paper doll'} has been shared to {selectedCircleIds.length} circle{selectedCircleIds.length > 1 ? 's' : ''}!</p>
			</div>
		{:else}
			<h3 class="font-bold text-2xl mb-4">Share to Circles 🎉</h3>
			<p class="text-gray-600 mb-4">
				Select which circles you want to share this {itemType === 'design' ? 'design' : 'paper doll'} with:
			</p>

			{#if loading}
				<div class="flex justify-center py-8">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if circles.length === 0}
				<div class="text-center py-8">
					<p class="text-gray-600 mb-4">You're not in any circles yet!</p>
					<a href="/circles" class="btn btn-primary">Create or Join a Circle</a>
				</div>
			{:else}
				<div class="space-y-2 max-h-96 overflow-y-auto">
					{#each circles as circle}
						<label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
							class:border-primary={selectedCircleIds.includes(circle.id)}
							class:bg-primary={selectedCircleIds.includes(circle.id)}
							class:bg-opacity-5={selectedCircleIds.includes(circle.id)}
						>
							<input
								type="checkbox"
								class="checkbox checkbox-primary"
								checked={selectedCircleIds.includes(circle.id)}
								onchange={() => toggleCircle(circle.id)}
							/>
							<div class="flex-1">
								<p class="font-semibold">{circle.name}</p>
								<p class="text-sm text-gray-500">
									{circle.memberCount} member{circle.memberCount !== 1 ? 's' : ''}
								</p>
							</div>
							{#if circle.isOwner}
								<div class="badge badge-primary badge-sm">Owner</div>
							{/if}
						</label>
					{/each}
				</div>

				{#if error}
					<div class="alert alert-error mt-4">
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
				{/if}

				<div class="modal-action">
					<button class="btn btn-ghost" onclick={onclose} disabled={sharing}>
						Cancel
					</button>
					<button
						class="btn btn-primary"
						onclick={handleShare}
						disabled={sharing || selectedCircleIds.length === 0}
					>
						{#if sharing}
							<span class="loading loading-spinner loading-sm"></span>
							Sharing...
						{:else}
							Share to {selectedCircleIds.length} Circle{selectedCircleIds.length !== 1 ? 's' : ''} ✨
						{/if}
					</button>
				</div>
			{/if}
		{/if}
	</div>
	<div class="modal-backdrop bg-black bg-opacity-50" onclick={onclose}></div>
</div>
