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
	let mobileMenuOpen = $state(false);

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST'
			});

			if (response.ok) {
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Logout error:', error);
			window.location.href = '/';
		}
	}

	function getAvatarLetter(): string {
		return data.user?.nickname?.charAt(0).toUpperCase() || 'U';
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<!-- Navigation -->
<nav class="navbar bg-white shadow-lg mb-4 lg:mb-8">
	<div class="navbar-start">
		<!-- Mobile Menu Button -->
		<div class="lg:hidden">
			<button 
				class="btn btn-ghost btn-circle" 
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label="Toggle menu"
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>

		<a href="/" class="btn btn-ghost text-xl lg:text-3xl">
			<span class="text-2xl lg:text-4xl">✨</span>
			<span
				class="font-black bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent"
			>
				Wrigs Fashion
			</span>
		</a>
	</div>

	<!-- Desktop Navigation -->
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/upload" class="min-h-11">Upload</a></li>
			<li><a href="/catalogs" class="min-h-11">My Catalogs</a></li>
			{#if data.user}
				<li><a href="/circles" class="min-h-11">Circles</a></li>
			{/if}
		</ul>
	</div>

	<div class="navbar-end gap-2">
		{#if data.user}
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
					<li><a href="/catalogs">My Catalogs</a></li>
					<li><a href="/circles">My Circles</a></li>
					<li><a href="/settings">Settings</a></li>
					<li><button onclick={handleLogout} data-testid="logout-button">Log Out 👋</button></li>
				</ul>
			</div>
		{:else}
			<a href="/auth/login" class="btn btn-ghost btn-sm text-gray-700 min-h-10">
				Login
			</a>
			<a href="/auth/register" class="btn btn-secondary shadow-lg hover:shadow-xl hover:scale-105 transition-all min-h-10">
				Sign Up
			</a>
		{/if}
	</div>
</nav>

<!-- Mobile Navigation Menu -->
{#if mobileMenuOpen}
	<div class="lg:hidden bg-white shadow-lg mx-4 rounded-lg mb-4">
		<ul class="menu p-4">
			<li><a href="/upload" onclick={closeMobileMenu} class="btn btn-ghost justify-start min-h-12">📤 Upload</a></li>
			<li><a href="/catalogs" onclick={closeMobileMenu} class="btn btn-ghost justify-start min-h-12">📚 My Catalogs</a></li>
			{#if data.user}
				<li><a href="/circles" onclick={closeMobileMenu} class="btn btn-ghost justify-start min-h-12">👥 Circles</a></li>
				<li><a href="/circles/join" onclick={closeMobileMenu} class="btn btn-ghost justify-start min-h-12">➕ Join Circle</a></li>
			{:else}
				<li><a href="/auth/login" onclick={closeMobileMenu} class="btn btn-ghost justify-start min-h-12">🔑 Login</a></li>
				<li><a href="/auth/register" onclick={closeMobileMenu} class="btn btn-secondary justify-start min-h-12">✨ Sign Up</a></li>
			{/if}
		</ul>
	</div>
{/if}

<!-- Main Content -->
<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100 pb-20 lg:pb-0">
	<slot />
</div>

<!-- Footer -->
<footer class="footer footer-center p-6 lg:p-10 bg-white text-base-content shadow-inner mt-auto">
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
