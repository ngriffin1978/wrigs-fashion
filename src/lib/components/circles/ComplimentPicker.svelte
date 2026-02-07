<script lang="ts">
	interface Props {
		sharedItemId: string;
		onComplimentAdded: () => void;
	}

	let { sharedItemId, onComplimentAdded }: Props = $props();

	const COMPLIMENTS = [
		{ type: 'so_creative', text: 'So creative! 🎨' },
		{ type: 'love_colors', text: 'Love the colors! 🌈' },
		{ type: 'amazing_design', text: 'Amazing design! ✨' },
		{ type: 'super_cool', text: 'Super cool! 😎' },
		{ type: 'beautiful_work', text: 'Beautiful work! 💖' },
		{ type: 'wow_awesome', text: 'Wow! This is awesome! 🤩' },
		{ type: 'great_style', text: 'Great style! 👗' },
		{ type: 'so_pretty', text: 'This is so pretty! 🌸' }
	];

	let loading = $state(false);
	let error = $state('');

	async function addCompliment(complimentType: string) {
		if (loading) return;

		loading = true;
		error = '';

		try {
			const res = await fetch(`/api/shared-items/${sharedItemId}/compliment`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ complimentType })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to add compliment');
			}

			onComplimentAdded();
		} catch (err: any) {
			error = err.message || 'Failed to add compliment';
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-gray-50 rounded-lg p-4">
	<p class="text-sm font-medium text-gray-700 mb-3">Choose a compliment:</p>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
		{#each COMPLIMENTS as compliment}
			<button
				class="btn btn-sm btn-outline justify-start"
				onclick={() => addCompliment(compliment.type)}
				disabled={loading}
			>
				{compliment.text}
			</button>
		{/each}
	</div>

	{#if error}
		<div class="alert alert-error mt-2">
			<span class="text-sm">{error}</span>
		</div>
	{/if}
</div>
