<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let countdown = $state(3);

	onMount(() => {
		const interval = setInterval(() => {
			countdown--;
			if (countdown === 0) {
				clearInterval(interval);
				goto('/portfolio');
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Welcome! - Wrigs Fashion</title>
</svelte:head>

<div class="hero min-h-screen">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-6xl font-bold mb-4">
				🎉 Welcome to Wrigs Fashion! 🎉
			</h1>
			<p class="text-2xl mb-8">
				Your account is all set! Let's create something amazing! ✨
			</p>
			<div class="text-6xl mb-6">🎨 👗 ✂️</div>
			<p class="text-lg text-gray-600 mb-8">
				Redirecting to your portfolio in {countdown}...
			</p>
			<button class="btn btn-primary btn-lg" onclick={() => goto('/portfolio')}>
				Go to Portfolio Now! 🚀
			</button>
		</div>
	</div>
</div>
