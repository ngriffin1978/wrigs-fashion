<script lang="ts">
	import '../app.css';
	import ColorCustomizer from '$lib/components/ColorCustomizer.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		data: {
			user: {
				id: string;
				email: string;
				nickname: string;
				avatarUrl?: string;
				emailVerified: boolean;
				role: string;
			} | null;
		};
	}

	let { data }: Props = $props();

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST'
			});

			if (response.ok) {
				// Redirect to homepage after logout
				goto('/');
			}
		} catch (error) {
			console.error('Logout error:', error);
			// Still redirect even if there's an error
			goto('/');
		}
	}

	// Get first letter of nickname for avatar
	function getAvatarLetter(): string {
		return data.user?.nickname?.charAt(0).toUpperCase() || 'U';
	}
</script>

<!-- Navigation -->
<nav class="navbar bg-white shadow-lg mb-8">
	<div class="navbar-start">
		<a href="/" class="btn btn-ghost text-3xl">
			<span class="text-4xl">✨</span>
			<span
				class="font-black bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent"
			>
				Wrigs Fashion
			</span>
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/upload">Upload</a></li>
			<li><a href="/catalogs">Catalogs</a></li>
			{#if data.user}
				<li><a href="/portfolio">Portfolio</a></li>
				<li><a href="/circles">Circles</a></li>
			{/if}
		</ul>
	</div>
	<div class="navbar-end gap-2">
		{#if data.user}
			<!-- Authenticated User -->
			<span class="text-sm hidden sm:inline">Hi, {data.user.nickname}! 👋</span>

			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-ghost btn-circle avatar">
					{#if data.user.avatarUrl}
						<div class="w-10 rounded-full">
							<img src={data.user.avatarUrl} alt={data.user.nickname} />
						</div>
					{:else}
						<div
							class="w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold"
						>
							{getAvatarLetter()}
						</div>
					{/if}
				</label>
				<ul
					tabindex="0"
					class="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-white rounded-box w-52"
				>
					<li><a href="/portfolio">My Portfolio</a></li>
					<li><a href="/catalogs">My Catalogs</a></li>
					<li><a href="/circles">My Circles</a></li>
					<li><a href="/settings">Settings</a></li>
					<li><button onclick={handleLogout} data-testid="logout-button">Log Out 👋</button></li>
				</ul>
			</div>
		{:else}
			<!-- Not Authenticated -->
			<a href="/auth/login" class="btn btn-ghost">
				Login 🔑
			</a>
			<a href="/auth/register" class="btn btn-primary">
				Sign Up 🚀
			</a>
		{/if}
	</div>
</nav>

<!-- Main Content -->
<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100">
	<slot />
</div>

<!-- Footer -->
<footer class="footer footer-center p-10 bg-white text-base-content shadow-inner mt-12">
	<div>
		<p class="font-bold text-lg">
			<span class="text-primary">✨</span> Wrigs Fashion
		</p>
		<p>Draw. Digitize. Play! 🎨</p>
		<p class="text-sm text-gray-500">Made with love for creative kids</p>
	</div>
</footer>

<!-- Color Customizer -->
<ColorCustomizer />
