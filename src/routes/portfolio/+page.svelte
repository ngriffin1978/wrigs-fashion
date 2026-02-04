<script lang="ts">
	// Portfolio page - will be populated with actual designs later
	const designs = [
		{ id: 1, name: 'Summer Dress', emoji: '👗', gradient: 'from-pink-200 to-rose-200', date: '2 days ago', category: 'Dress' },
		{ id: 2, name: 'Cool Jacket', emoji: '👔', gradient: 'from-blue-200 to-cyan-200', date: '1 week ago', category: 'Jacket' },
		{ id: 3, name: 'Sparkle Top', emoji: '👚', gradient: 'from-yellow-200 to-orange-200', date: '2 weeks ago', category: 'Top' }
	];
</script>

<svelte:head>
	<title>My Portfolio - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 pb-12">
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-3xl font-bold text-gray-800">My Portfolio 📁</h2>
		<div class="flex gap-2">
			<button class="btn btn-outline">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 10h16M4 14h16M4 18h16"
					/>
				</svg>
				Grid
			</button>
			<button class="btn btn-outline">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
				List
			</button>
		</div>
	</div>

	<!-- Portfolio Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each designs as design}
			<div class="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
				<figure
					class="aspect-square bg-gradient-to-br {design.gradient} flex items-center justify-center"
				>
					<span class="text-8xl">{design.emoji}</span>
				</figure>
				<div class="card-body">
					<h3 class="card-title text-lg">{design.name}</h3>
					<p class="text-sm text-gray-500">Created {design.date}</p>
					<div class="card-actions justify-between items-center mt-2">
						<div class="flex gap-1">
							<span class="badge badge-primary">{design.category}</span>
						</div>
						<div class="dropdown dropdown-end">
							<label tabindex="0" class="btn btn-ghost btn-circle btn-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
									/>
								</svg>
							</label>
							<ul
								tabindex="0"
								class="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-box w-52"
							>
								<li><a>Edit</a></li>
								<li><a>Share to Circle</a></li>
								<li><a>Make Paper Doll</a></li>
								<li><a>Download</a></li>
								<li><a class="text-error">Delete</a></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		{/each}

		<!-- New Design Card -->
		<a
			href="/upload"
			class="card bg-white shadow-xl border-4 border-dashed border-primary hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
		>
			<figure class="aspect-square flex items-center justify-center">
				<div>
					<button class="btn btn-circle btn-lg btn-primary mb-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</button>
					<p class="text-center font-bold text-gray-500">Create New</p>
				</div>
			</figure>
		</a>
	</div>

	<!-- Stats -->
	<div class="stats stats-vertical lg:stats-horizontal shadow-xl bg-white mt-12 w-full">
		<div class="stat">
			<div class="stat-figure text-primary">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<div class="stat-title">Total Designs</div>
			<div class="stat-value text-primary">12</div>
			<div class="stat-desc">Keep creating! ✨</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-secondary">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			</div>
			<div class="stat-title">Shared With</div>
			<div class="stat-value text-secondary">3 Circles</div>
			<div class="stat-desc">Friends love your work!</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-accent">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
			</div>
			<div class="stat-title">Reactions</div>
			<div class="stat-value text-accent">45 ❤️</div>
			<div class="stat-desc">You're amazing!</div>
		</div>
	</div>
</div>
