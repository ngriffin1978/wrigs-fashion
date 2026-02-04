<script lang="ts">
	import '../app.css';
	import ColorCustomizer from '$lib/components/ColorCustomizer.svelte';
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
	<div class="navbar-end">
		<button class="btn btn-ghost btn-circle">
			<div class="indicator">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a 3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
				<span class="badge badge-xs badge-primary indicator-item"></span>
			</div>
		</button>
		<div class="dropdown dropdown-end">
			<label tabindex="0" class="btn btn-ghost btn-circle avatar">
				<div
					class="w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold"
				>
					M
				</div>
			</label>
			<ul
				tabindex="0"
				class="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-white rounded-box w-52"
			>
				<li><a href="/portfolio">My Portfolio</a></li>
				<li><a href="/catalogs">My Catalogs</a></li>
				<li><a href="/circles">My Circles</a></li>
				<li><a>Settings</a></li>
				<li><a>Logout</a></li>
			</ul>
		</div>
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
