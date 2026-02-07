<script lang="ts">
	interface Props {
		icon?: string;
		title: string;
		description?: string;
		actionLabel?: string;
		onaction?: () => void;
	}

	let { icon = '🎨', title, description, actionLabel, onaction }: Props = $props();
</script>

<div class="text-center py-16">
	<div class="text-6xl mb-4">{icon}</div>
	<h3 class="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
	{#if description}
		<p class="text-gray-600 mb-6">{description}</p>
	{/if}
	{#if actionLabel && onaction}
		<button class="btn btn-primary btn-lg" onclick={onaction}>
			{actionLabel}
		</button>
	{/if}
</div>
