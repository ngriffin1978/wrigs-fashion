<script lang="ts">
	interface Props {
		sharedItemId: string;
	}

	let { sharedItemId }: Props = $props();

	// Reaction types with emojis
	const REACTIONS = [
		{ type: 'love', emoji: '❤️', label: 'Love' },
		{ type: 'creative', emoji: '🎨', label: 'Creative' },
		{ type: 'amazing', emoji: '✨', label: 'Amazing' },
		{ type: 'fire', emoji: '🔥', label: 'Fire' },
		{ type: 'star', emoji: '🌟', label: 'Star' },
		{ type: 'applause', emoji: '👏', label: 'Applause' }
	];

	let reactions = $state<any[]>([]);
	let reactionCounts = $state<Record<string, number>>({});
	let userReactions = $state<string[]>([]);
	let loading = $state(false);

	// Load reactions on mount
	$effect(() => {
		loadReactions();
	});

	async function loadReactions() {
		try {
			const res = await fetch(`/api/shared-items/${sharedItemId}/reactions`);
			if (res.ok) {
				const data = await res.json();
				reactions = data.reactions || [];
				reactionCounts = data.reactionCounts || {};
				userReactions = data.userReactions || [];
			}
		} catch (err) {
			console.error('Failed to load reactions:', err);
		}
	}

	async function toggleReaction(reactionType: string) {
		if (loading) return;

		// Optimistic update
		const wasReacted = userReactions.includes(reactionType);
		if (wasReacted) {
			userReactions = userReactions.filter((r) => r !== reactionType);
			reactionCounts[reactionType] = (reactionCounts[reactionType] || 1) - 1;
		} else {
			userReactions = [...userReactions, reactionType];
			reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;
		}

		loading = true;

		try {
			const res = await fetch(`/api/shared-items/${sharedItemId}/react`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reactionType })
			});

			if (!res.ok) {
				// Revert on error
				if (wasReacted) {
					userReactions = [...userReactions, reactionType];
					reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;
				} else {
					userReactions = userReactions.filter((r) => r !== reactionType);
					reactionCounts[reactionType] = (reactionCounts[reactionType] || 1) - 1;
				}
			}
		} catch (err) {
			console.error('Failed to toggle reaction:', err);
			// Revert on error
			if (wasReacted) {
				userReactions = [...userReactions, reactionType];
				reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;
			} else {
				userReactions = userReactions.filter((r) => r !== reactionType);
				reactionCounts[reactionType] = (reactionCounts[reactionType] || 1) - 1;
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each REACTIONS as reaction}
		{@const count = reactionCounts[reaction.type] || 0}
		{@const isReacted = userReactions.includes(reaction.type)}

		<button
			class="btn btn-sm"
			class:btn-primary={isReacted}
			class:btn-outline={!isReacted}
			onclick={() => toggleReaction(reaction.type)}
			disabled={loading}
			title={reaction.label}
		>
			<span class="text-lg">{reaction.emoji}</span>
			{#if count > 0}
				<span class="font-semibold">{count}</span>
			{/if}
		</button>
	{/each}
</div>
