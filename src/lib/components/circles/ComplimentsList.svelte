<script lang="ts">
	import ComplimentPicker from './ComplimentPicker.svelte';

	interface Props {
		sharedItemId: string;
	}

	let { sharedItemId }: Props = $props();

	let compliments = $state<any[]>([]);
	let showPicker = $state(false);

	// Load compliments on mount
	$effect(() => {
		loadCompliments();
	});

	async function loadCompliments() {
		try {
			const res = await fetch(`/api/shared-items/${sharedItemId}/reactions`);
			if (res.ok) {
				const data = await res.json();
				compliments = data.compliments || [];
			}
		} catch (err) {
			console.error('Failed to load compliments:', err);
		}
	}

	function handleComplimentAdded() {
		showPicker = false;
		loadCompliments(); // Reload to show new compliment
	}

	function getComplimentText(type: string): string {
		const types: Record<string, string> = {
			so_creative: 'So creative! 🎨',
			love_colors: 'Love the colors! 🌈',
			amazing_design: 'Amazing design! ✨',
			super_cool: 'Super cool! 😎',
			beautiful_work: 'Beautiful work! 💖',
			wow_awesome: 'Wow! This is awesome! 🤩',
			great_style: 'Great style! 👗',
			so_pretty: 'This is so pretty! 🌸'
		};
		return types[type] || type;
	}
</script>

<div>
	<div class="flex justify-between items-center mb-2">
		<h4 class="font-semibold text-gray-700">Compliments 💖</h4>
		<button class="btn btn-xs btn-ghost" onclick={() => (showPicker = !showPicker)}>
			{showPicker ? 'Cancel' : '+ Add'}
		</button>
	</div>

	{#if showPicker}
		<div class="mb-4">
			<ComplimentPicker {sharedItemId} onComplimentAdded={handleComplimentAdded} />
		</div>
	{/if}

	{#if compliments.length === 0}
		<p class="text-sm text-gray-500 italic">No compliments yet. Be the first! ✨</p>
	{:else}
		<div class="space-y-2">
			{#each compliments as compliment}
				<div class="flex items-start gap-2 text-sm">
					<div class="avatar placeholder">
						<div class="bg-secondary text-secondary-content rounded-full w-6">
							<span class="text-xs">{compliment.user?.name?.[0] || '?'}</span>
						</div>
					</div>
					<div>
						<span class="font-medium">{compliment.user?.name || 'Unknown'}</span>
						<span class="text-gray-600">: {getComplimentText(compliment.complimentType)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
