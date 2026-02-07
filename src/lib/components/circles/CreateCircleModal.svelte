<script lang="ts">
	import { goto } from '$app/navigation';
	import InviteCodeModal from './InviteCodeModal.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let name = $state('');
	let loading = $state(false);
	let error = $state('');
	let createdCircle: any = $state(null);
	let showInviteCode = $state(false);

	async function handleSubmit() {
		if (!name.trim()) {
			error = 'Please enter a circle name';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch('/api/circles', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name.trim() })
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to create circle');
			}

			createdCircle = data.circle;
			showInviteCode = true;
		} catch (err: any) {
			error = err.message || 'Something went wrong! Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleInviteCodeClose() {
		showInviteCode = false;
		onclose();
		// Reload to show new circle
		location.reload();
	}
</script>

{#if showInviteCode && createdCircle}
	<InviteCodeModal circle={createdCircle} onclose={handleInviteCodeClose} />
{:else}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-2xl mb-4">Create a Circle 🎉</h3>
			<p class="text-gray-600 mb-4">
				Give your circle a fun name! You'll get an invite code to share with friends.
			</p>

			<form onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}>
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Circle Name</span>
					</label>
					<input
						type="text"
						bind:value={name}
						placeholder="Fashion Squad, Design Besties, etc."
						class="input input-bordered w-full"
						maxlength="100"
						disabled={loading}
						autofocus
					/>
					{#if name.length > 0}
						<label class="label">
							<span class="label-text-alt text-gray-500">{name.length}/100 characters</span>
						</label>
					{/if}
				</div>

				{#if error}
					<div class="alert alert-error mt-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{error}</span>
					</div>
				{/if}

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={onclose} disabled={loading}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={loading || !name.trim()}>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
							Creating...
						{:else}
							Create Circle ✨
						{/if}
					</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop bg-black bg-opacity-50" onclick={onclose}></div>
	</div>
{/if}
