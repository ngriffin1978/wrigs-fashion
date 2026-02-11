<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		DOLL_TEMPLATES,
		BODY_TYPE_DESCRIPTIONS,
		POSE_DESCRIPTIONS,
		type DollTemplate,
		type DollBodyType,
		type DollPose
	} from '$lib/data/doll-templates';

	// Get design image from query params (passed from editor)
	let designImageUrl = $state('');
	let selectedTemplate = $state<DollTemplate | null>(null);
	let filterPose = $state<DollPose | 'all'>('all');
	let filterBodyType = $state<DollBodyType | 'all'>('all');

	onMount(() => {
		designImageUrl = $page.url.searchParams.get('design') || '';
		if (!designImageUrl) {
			// If no design, redirect back to upload
			console.warn('No design image provided');
		}
	});

	let filteredTemplates = $derived(
		DOLL_TEMPLATES.filter((template) => {
			const poseMatch = filterPose === 'all' || template.pose === filterPose;
			const bodyMatch = filterBodyType === 'all' || template.bodyType === filterBodyType;
			return poseMatch && bodyMatch;
		})
	);

	function selectTemplate(template: DollTemplate) {
		selectedTemplate = template;
		// Navigate to placement page with template and design
		window.location.href = `/doll-builder/place?template=${template.id}&design=${encodeURIComponent(designImageUrl)}`;
	}
</script>

<svelte:head>
	<title>Choose Your Paper Doll - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold mb-2">
			<span class="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
				Choose Your Paper Doll
			</span>
		</h1>
		<p class="text-lg text-gray-600">Pick a pose and body type that matches your style!</p>
	</div>

	<!-- Design Preview (small reminder of what they created) -->
	{#if designImageUrl}
		<div class="card bg-white shadow-lg mb-8 p-4">
			<div class="flex items-center gap-4">
				<div class="w-20 h-20 flex-shrink-0">
					<img src={designImageUrl} alt="Your design" class="w-full h-full object-contain" />
				</div>
				<div>
					<h3 class="font-bold text-lg">Your Amazing Design</h3>
					<p class="text-sm text-gray-600">Now let's put it on a paper doll!</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Filters -->
	<div class="card bg-white shadow-lg p-6 mb-8">
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Pose Filter -->
			<div>
				<label class="label">
					<span class="label-text font-bold text-lg">Choose a Pose:</span>
				</label>
				<div class="flex flex-col gap-2" role="radiogroup" aria-label="Pose filter">
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="pose"
							value="all"
							checked={filterPose === 'all'}
							onchange={() => (filterPose = 'all')}
							class="radio radio-primary"
							aria-label="All Poses"
						/>
						<div>
							<div class="font-semibold">All Poses</div>
							<div class="text-xs text-gray-500">See everything!</div>
						</div>
					</label>
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="pose"
							value="pose-a"
							checked={filterPose === 'pose-a'}
							onchange={() => (filterPose = 'pose-a')}
							class="radio radio-primary"
							aria-label="Pose A - Classic Pose (Arms Out)"
						/>
						<div>
							<div class="font-semibold">Pose A - Classic (Arms Out)</div>
							<div class="text-xs text-gray-500">{POSE_DESCRIPTIONS['pose-a']}</div>
						</div>
					</label>
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="pose"
							value="pose-b"
							checked={filterPose === 'pose-b'}
							onchange={() => (filterPose = 'pose-b')}
							class="radio radio-primary"
							aria-label="Pose B - Standing Pose (Arms Down)"
						/>
						<div>
							<div class="font-semibold">Pose B - Standing (Arms Down)</div>
							<div class="text-xs text-gray-500">{POSE_DESCRIPTIONS['pose-b']}</div>
						</div>
					</label>
				</div>
			</div>

			<!-- Body Type Filter -->
			<div>
				<label class="label">
					<span class="label-text font-bold text-lg">Choose a Body Type:</span>
				</label>
				<div class="flex flex-col gap-2" role="radiogroup" aria-label="Body type filter">
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="bodyType"
							value="all"
							checked={filterBodyType === 'all'}
							onchange={() => (filterBodyType = 'all')}
							class="radio radio-secondary"
							aria-label="All Body Types"
						/>
						<div>
							<div class="font-semibold">All Body Types</div>
							<div class="text-xs text-gray-500">Every body is beautiful!</div>
						</div>
					</label>
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="bodyType"
							value="average"
							checked={filterBodyType === 'average'}
							onchange={() => (filterBodyType = 'average')}
							class="radio radio-secondary"
							aria-label="Classic Build"
						/>
						<div>
							<div class="font-semibold">Classic Build</div>
							<div class="text-xs text-gray-500">{BODY_TYPE_DESCRIPTIONS.average}</div>
						</div>
					</label>
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="bodyType"
							value="curvy"
							checked={filterBodyType === 'curvy'}
							onchange={() => (filterBodyType = 'curvy')}
							class="radio radio-secondary"
							aria-label="Curvy Build"
						/>
						<div>
							<div class="font-semibold">Curvy Build</div>
							<div class="text-xs text-gray-500">{BODY_TYPE_DESCRIPTIONS.curvy}</div>
						</div>
					</label>
					<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors">
						<input
							type="radio"
							name="bodyType"
							value="petite"
							checked={filterBodyType === 'petite'}
							onchange={() => (filterBodyType = 'petite')}
							class="radio radio-secondary"
							aria-label="Petite Build"
						/>
						<div>
							<div class="font-semibold">Petite Build</div>
							<div class="text-xs text-gray-500">{BODY_TYPE_DESCRIPTIONS.petite}</div>
						</div>
					</label>
				</div>
			</div>
		</div>
	</div>

	<!-- Template Grid -->
	<div class="mb-8">
		<h2 class="text-2xl font-bold mb-4 text-gray-800">
			{filteredTemplates.length} {filteredTemplates.length === 1 ? 'Template' : 'Templates'} Available
		</h2>

		{#if filteredTemplates.length === 0}
			<div class="card bg-white shadow-xl p-12 text-center">
				<p class="text-xl text-gray-500">No templates match your filters. Try different options!</p>
			</div>
		{:else}
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredTemplates as template}
					<div
						onclick={() => selectTemplate(template)}
						class="template-card card bg-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && selectTemplate(template)}
					>
						<figure class="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
							<img src={template.baseImageUrl} alt={template.displayName} class="h-64 object-contain" />
						</figure>
						<div class="card-body">
							<h3 class="card-title text-lg">{template.displayName}</h3>
							<div class="flex flex-wrap gap-2 mb-2">
								<span class="badge badge-primary">{template.poseDescription}</span>
								<span class="badge badge-secondary">{template.bodyTypeDisplay}</span>
							</div>
							<div class="text-sm text-gray-500 mt-2">Click to choose this doll →</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Info Box -->
	<div class="alert alert-info shadow-lg">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="stroke-current shrink-0 w-6 h-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<div>
			<h3 class="font-bold">All Bodies Are Beautiful!</h3>
			<div class="text-sm">
				Pick the doll that feels right for your design. There's no wrong choice - every body type is perfect for fashion!
			</div>
		</div>
	</div>
</div>

<style>
	.template-card {
		transition: all 0.2s ease;
	}

	.template-card:hover {
		transform: translateY(-4px);
	}
</style>
