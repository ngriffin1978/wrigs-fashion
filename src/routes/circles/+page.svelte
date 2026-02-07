<script lang="ts">
	import type { PageData } from './$types';
	import CreateCircleModal from '$lib/components/circles/CreateCircleModal.svelte';
	import JoinCircleModal from '$lib/components/circles/JoinCircleModal.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let showCreateModal = $state(false);
	let showJoinModal = $state(false);

	// Format date to relative time
	function formatDate(dateInput: string | Date): string {
		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return date.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>My Circles - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 pb-12">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h2 class="text-3xl font-bold text-gray-800">My Circles 🎉</h2>
			<p class="text-gray-600 mt-1">Share your designs with friends in invite-only groups</p>
		</div>
		<div class="flex gap-2">
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
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
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Create Circle
			</button>
			<button class="btn btn-outline" onclick={() => (showJoinModal = true)}>
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
						d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
					/>
				</svg>
				Join Circle
			</button>
		</div>
	</div>

	<!-- Circles Grid -->
	{#if data.circles.length === 0}
		<!-- Empty State -->
		<div class="col-span-full text-center py-16">
			<div class="text-6xl mb-4">🎉</div>
			<h3 class="text-2xl font-bold text-gray-800 mb-2">You're not in any circles yet!</h3>
			<p class="text-gray-600 mb-6">
				Create a circle to share your designs with friends, or join an existing one with an invite
				code! ✨
			</p>
			<div class="flex gap-4 justify-center">
				<button class="btn btn-primary btn-lg" onclick={() => (showCreateModal = true)}>
					Create Your First Circle 🚀
				</button>
				<button class="btn btn-outline btn-lg" onclick={() => (showJoinModal = true)}>
					Join a Circle 👋
				</button>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.circles as circle}
				<a
					href="/circles/{circle.id}"
					class="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
				>
					<div class="card-body">
						<div class="flex justify-between items-start">
							<h3 class="card-title text-xl truncate flex-1">{circle.name}</h3>
							{#if circle.isOwner}
								<div class="badge badge-primary badge-sm">Owner</div>
							{:else}
								<div class="badge badge-secondary badge-sm">Member</div>
							{/if}
						</div>

						<div class="flex items-center gap-2 text-sm text-gray-600 mt-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
							<span>{circle.memberCount} member{circle.memberCount !== 1 ? 's' : ''}</span>
						</div>

						<div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>Created {formatDate(circle.createdAt)}</span>
						</div>

						{#if circle.owner}
							<div class="flex items-center gap-2 text-sm text-gray-600 mt-2 pt-2 border-t">
								<div class="avatar placeholder">
									<div class="bg-primary text-primary-content rounded-full w-6">
										<span class="text-xs">{circle.owner.name?.[0] || '?'}</span>
									</div>
								</div>
								<span class="truncate">by {circle.owner.name || 'Unknown'}</span>
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<!-- Stats -->
	{#if data.circles.length > 0}
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
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<div class="stat-title">Total Circles</div>
				<div class="stat-value text-primary">{data.total}</div>
				<div class="stat-desc">
					{data.circles.filter((c) => c.isOwner).length} owned,
					{data.circles.filter((c) => !c.isOwner).length} joined
				</div>
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
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				</div>
				<div class="stat-title">Total Members</div>
				<div class="stat-value text-secondary">
					{data.circles.reduce((sum, c) => sum + c.memberCount, 0)}
				</div>
				<div class="stat-desc">Across all your circles</div>
			</div>
		</div>
	{/if}
</div>

<!-- Modals -->
{#if showCreateModal}
	<CreateCircleModal onclose={() => (showCreateModal = false)} />
{/if}

{#if showJoinModal}
	<JoinCircleModal onclose={() => (showJoinModal = false)} />
{/if}
