<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import InviteCodeModal from '$lib/components/circles/InviteCodeModal.svelte';
	import SharedItemCard from '$lib/components/circles/SharedItemCard.svelte';
	import EmptyState from '$lib/components/circles/EmptyState.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let showInviteCode = $state(false);
	let showLeaveConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let loading = $state(false);

	async function leaveCircle() {
		loading = true;
		try {
			const res = await fetch(`/api/circles/${data.circle.id}/leave`, {
				method: 'POST'
			});

			if (res.ok) {
				goto('/circles');
			} else {
				const error = await res.json();
				alert(error.message || 'Failed to leave circle');
			}
		} catch (err) {
			alert('Failed to leave circle. Please try again.');
		} finally {
			loading = false;
			showLeaveConfirm = false;
		}
	}

	async function deleteCircle() {
		loading = true;
		try {
			const res = await fetch(`/api/circles/${data.circle.id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				goto('/circles');
			} else {
				const error = await res.json();
				alert(error.message || 'Failed to delete circle');
			}
		} catch (err) {
			alert('Failed to delete circle. Please try again.');
		} finally {
			loading = false;
			showDeleteConfirm = false;
		}
	}
</script>

<svelte:head>
	<title>{data.circle.name} - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 pb-12">
	<!-- Header -->
	<div class="flex justify-between items-start mb-6">
		<div>
			<div class="flex items-center gap-3 mb-2">
				<button class="btn btn-ghost btn-sm" onclick={() => goto('/circles')}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back to Circles
				</button>
			</div>
			<div class="flex items-center gap-3">
				<h2 class="text-3xl font-bold text-gray-800">{data.circle.name}</h2>
				{#if data.circle.isOwner}
					<div class="badge badge-primary">Owner</div>
				{:else}
					<div class="badge badge-secondary">Member</div>
				{/if}
			</div>
			<p class="text-gray-600 mt-2">
				{data.circle.memberCount} member{data.circle.memberCount !== 1 ? 's' : ''}
				• {data.items.length} shared item{data.items.length !== 1 ? 's' : ''}
			</p>
		</div>

		<!-- Actions -->
		<div class="dropdown dropdown-end">
			<label tabindex="0" class="btn btn-ghost btn-circle">
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
						d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
					/>
				</svg>
			</label>
			<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-box w-52">
				<li>
					<button onclick={() => (showInviteCode = true)}>
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
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						View Invite Code
					</button>
				</li>
				{#if !data.circle.isOwner}
					<li>
						<button class="text-error" onclick={() => (showLeaveConfirm = true)}>
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
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Leave Circle
						</button>
					</li>
				{:else}
					<li>
						<button class="text-error" onclick={() => (showDeleteConfirm = true)}>
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
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete Circle
						</button>
					</li>
				{/if}
			</ul>
		</div>
	</div>

	<!-- Members List -->
	<div class="card bg-white shadow-xl mb-6">
		<div class="card-body">
			<h3 class="card-title">Members</h3>
			<div class="flex flex-wrap gap-2 mt-2">
				{#each data.circle.members as member}
					<div class="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
						<div class="avatar placeholder">
							<div class="bg-primary text-primary-content rounded-full w-8">
								<span class="text-xs">{member.user.name?.[0] || '?'}</span>
							</div>
						</div>
						<span class="font-medium">{member.user.name || 'Unknown'}</span>
						{#if member.role === 'owner'}
							<div class="badge badge-primary badge-xs">Owner</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Shared Items Feed -->
	<h3 class="text-2xl font-bold text-gray-800 mb-4">Shared Designs 🎨</h3>

	{#if data.items.length === 0}
		<EmptyState
			icon="🎨"
			title="No designs shared yet"
			description="Be the first to share a design with this circle! Share from your portfolio or after creating a paper doll."
		/>
	{:else}
		<div class="grid grid-cols-1 gap-6">
			{#each data.items as item}
				<SharedItemCard {item} circleId={data.circle.id} />
			{/each}
		</div>
	{/if}
</div>

<!-- Modals -->
{#if showInviteCode}
	<InviteCodeModal circle={data.circle} onclose={() => (showInviteCode = false)} />
{/if}

{#if showLeaveConfirm}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-xl mb-4">Leave Circle?</h3>
			<p class="text-gray-600 mb-4">
				Are you sure you want to leave <strong>{data.circle.name}</strong>? You'll need a new invite
				code to rejoin.
			</p>
			<div class="modal-action">
				<button class="btn btn-ghost" onclick={() => (showLeaveConfirm = false)} disabled={loading}>
					Cancel
				</button>
				<button class="btn btn-error" onclick={leaveCircle} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
						Leaving...
					{:else}
						Leave Circle
					{/if}
				</button>
			</div>
		</div>
		<div class="modal-backdrop bg-black bg-opacity-50"></div>
	</div>
{/if}

{#if showDeleteConfirm}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-xl mb-4">Delete Circle?</h3>
			<p class="text-gray-600 mb-4">
				Are you sure you want to delete <strong>{data.circle.name}</strong>? This will remove all
				members and cannot be undone.
			</p>
			<div class="modal-action">
				<button class="btn btn-ghost" onclick={() => (showDeleteConfirm = false)} disabled={loading}>
					Cancel
				</button>
				<button class="btn btn-error" onclick={deleteCircle} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
						Deleting...
					{:else}
						Delete Circle
					{/if}
				</button>
			</div>
		</div>
		<div class="modal-backdrop bg-black bg-opacity-50"></div>
	</div>
{/if}
