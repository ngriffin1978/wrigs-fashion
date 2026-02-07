<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let inviteCode = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);
	let joinedCircle: any = $state(null);

	async function handleSubmit() {
		if (!inviteCode.trim()) {
			error = 'Please enter an invite code';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch('/api/circles/join', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() })
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to join circle');
			}

			joinedCircle = data.circle;
			success = true;

			// Redirect after a short delay
			setTimeout(() => {
				goto(`/circles/${joinedCircle.id}`);
			}, 1500);
		} catch (err: any) {
			error = err.message || 'Something went wrong! Please try again.';
		} finally {
			loading = false;
		}
	}

	function formatCode(value: string) {
		// Auto-uppercase and limit to 8 characters
		return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inviteCode = formatCode(target.value);
	}
</script>

<svelte:head>
	<title>Join Circle - Wrigs Fashion</title>
</svelte:head>

<div class="container mx-auto px-4 py-12">
	<div class="max-w-md mx-auto">
		{#if success}
			<div class="card bg-white shadow-xl">
				<div class="card-body text-center py-12">
					<div class="text-6xl mb-4">🎉</div>
					<h2 class="text-3xl font-bold mb-2">Welcome!</h2>
					<p class="text-gray-600 text-lg">You joined {joinedCircle?.name}!</p>
					<div class="flex justify-center mt-6">
						<span class="loading loading-spinner loading-lg text-primary"></span>
					</div>
					<p class="text-sm text-gray-500 mt-2">Redirecting...</p>
				</div>
			</div>
		{:else}
			<div class="card bg-white shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-3xl mb-2">Join a Circle 👋</h2>
					<p class="text-gray-600 mb-6">
						Enter the invite code your friend shared with you to join their circle!
					</p>

					<form
						onsubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Invite Code</span>
							</label>
							<input
								type="text"
								value={inviteCode}
								oninput={handleInput}
								placeholder="ABCD1234"
								class="input input-bordered input-lg w-full text-3xl font-mono text-center tracking-widest"
								maxlength="8"
								disabled={loading}
								autofocus
							/>
							<label class="label">
								<span class="label-text-alt text-gray-500">8-character code (case insensitive)</span>
							</label>
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

						<div class="flex gap-2 mt-6">
							<button
								type="button"
								class="btn btn-ghost flex-1"
								onclick={() => goto('/circles')}
								disabled={loading}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="btn btn-primary flex-1"
								disabled={loading || inviteCode.length !== 8}
							>
								{#if loading}
									<span class="loading loading-spinner loading-sm"></span>
									Joining...
								{:else}
									Join Circle 🚀
								{/if}
							</button>
						</div>
					</form>
				</div>
			</div>

			<div class="text-center mt-6">
				<p class="text-gray-600">
					Don't have a code?
					<a href="/circles" class="link link-primary">Create your own circle</a>
				</p>
			</div>
		{/if}
	</div>
</div>
