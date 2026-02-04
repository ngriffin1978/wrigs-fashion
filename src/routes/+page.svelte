<script lang="ts">
	// Home page component
</script>

<svelte:head>
	<title>Wrigs Fashion - Draw. Digitize. Play!</title>
</svelte:head>

<div class="container mx-auto px-4 pb-12">
	<!-- Hero Section -->
	<div class="hero bg-white rounded-3xl shadow-xl p-8 mb-8">
		<div class="hero-content text-center">
			<div class="max-w-2xl">
				<h1 class="text-5xl font-bold mb-4">
					<span
						class="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
					>
						Draw. Digitize. Play!
					</span>
				</h1>
				<p class="text-xl mb-6 text-gray-600">
					Turn your fashion drawings into amazing paper dolls ✨
				</p>
				<a href="/upload" class="btn btn-primary btn-lg sparkle shadow-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 mr-2"
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
					Start Creating
				</a>
			</div>
		</div>
	</div>

	<!-- Steps Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
		<!-- Step 1 Card -->
		<div class="card bg-white shadow-xl hover:shadow-2xl transition-shadow">
			<figure class="px-10 pt-10">
				<div
					class="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-5xl"
				>
					📷
				</div>
			</figure>
			<div class="card-body items-center text-center">
				<h2 class="card-title text-xl text-primary">1. Upload</h2>
				<p class="text-gray-600 text-sm">Take a photo of your fashion drawing</p>
			</div>
		</div>

		<!-- Step 2 Card -->
		<div class="card bg-white shadow-xl hover:shadow-2xl transition-shadow">
			<figure class="px-10 pt-10">
				<div
					class="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center text-5xl"
				>
					🎨
				</div>
			</figure>
			<div class="card-body items-center text-center">
				<h2 class="card-title text-xl text-secondary">2. Color It</h2>
				<p class="text-gray-600 text-sm">Add colors and fun patterns</p>
			</div>
		</div>

		<!-- Step 3 Card - Paper Doll -->
		<div class="card bg-white shadow-xl hover:shadow-2xl transition-shadow">
			<figure class="px-10 pt-10">
				<div
					class="w-24 h-24 bg-gradient-to-br from-accent to-success rounded-full flex items-center justify-center text-5xl"
				>
					👗
				</div>
			</figure>
			<div class="card-body items-center text-center">
				<h2 class="card-title text-xl text-accent">3. Paper Doll</h2>
				<p class="text-gray-600 text-sm">Put it on a paper doll!</p>
			</div>
		</div>

		<!-- Step 4 Card -->
		<div class="card bg-white shadow-xl hover:shadow-2xl transition-shadow">
			<figure class="px-10 pt-10">
				<div
					class="w-24 h-24 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center text-5xl"
				>
					🖨️
				</div>
			</figure>
			<div class="card-body items-center text-center">
				<h2 class="card-title text-xl text-success">4. Print & Play!</h2>
				<p class="text-gray-600 text-sm">Cut, fold, and play!</p>
			</div>
		</div>
	</div>

	<!-- Paper Dolls Feature -->
	<div class="card bg-white shadow-xl p-8 mb-8">
		<div class="flex flex-col md:flex-row items-center gap-6">
			<div
				class="w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
			>
				👗
			</div>
			<div class="flex-1 text-center md:text-left">
				<h2 class="text-2xl font-bold text-gray-800 mb-1">Paper Doll Maker</h2>
				<p class="text-gray-600">
					Turn your designs into printable paper dolls! Choose from 6 different body types and poses, then print and play!
				</p>
			</div>
			<div class="flex gap-3">
				<a href="/doll-builder" class="btn btn-accent">
					Browse Templates
				</a>
			</div>
		</div>
	</div>

	<!-- Fashion Catalogs -->
	<div class="card bg-white shadow-xl p-8 mb-12">
		<div class="flex flex-col md:flex-row items-center gap-6">
			<div
				class="w-20 h-20 bg-gradient-to-br from-purple-300 to-pink-300 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
			>
				📚
			</div>
			<div class="flex-1 text-center md:text-left">
				<h2 class="text-2xl font-bold text-gray-800 mb-1">Fashion Catalogs</h2>
				<p class="text-gray-600">
					Collect your designs on a canvas! Drag, resize, and arrange them however you like, then share with friends.
				</p>
			</div>
			<div class="flex gap-3">
				<a href="/catalogs" class="btn btn-primary">
					My Catalogs
				</a>
			</div>
		</div>
	</div>

	<!-- Recent Designs -->
	<div class="mt-12">
		<h2 class="text-3xl font-bold mb-6 text-gray-800">Your Recent Designs ✨</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<!-- Design Card 1 -->
			<div class="card bg-white shadow-lg hover:scale-105 transition-transform cursor-pointer">
				<figure
					class="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center"
				>
					<span class="text-6xl">👗</span>
				</figure>
				<div class="card-body p-4">
					<h3 class="font-bold">Summer Dress</h3>
					<p class="text-sm text-gray-500">2 days ago</p>
				</div>
			</div>

			<!-- Design Card 2 -->
			<div class="card bg-white shadow-lg hover:scale-105 transition-transform cursor-pointer">
				<figure
					class="aspect-square bg-gradient-to-br from-blue-200 to-cyan-200 flex items-center justify-center"
				>
					<span class="text-6xl">👔</span>
				</figure>
				<div class="card-body p-4">
					<h3 class="font-bold">Cool Jacket</h3>
					<p class="text-sm text-gray-500">1 week ago</p>
				</div>
			</div>

			<!-- Design Card 3 -->
			<div class="card bg-white shadow-lg hover:scale-105 transition-transform cursor-pointer">
				<figure
					class="aspect-square bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center"
				>
					<span class="text-6xl">👚</span>
				</figure>
				<div class="card-body p-4">
					<h3 class="font-bold">Sparkle Top</h3>
					<p class="text-sm text-gray-500">2 weeks ago</p>
				</div>
			</div>

			<!-- New Design Card -->
			<a
				href="/upload"
				class="card bg-white shadow-lg hover:scale-105 transition-transform cursor-pointer border-4 border-dashed border-primary"
			>
				<figure class="aspect-square flex items-center justify-center">
					<button class="btn btn-circle btn-lg btn-primary">
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
				</figure>
				<div class="card-body p-4">
					<h3 class="font-bold text-center">New Design</h3>
				</div>
			</a>
		</div>
	</div>
</div>
