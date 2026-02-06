<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	// Get returnUrl from query params
	const returnUrl = $page.url.searchParams.get('returnUrl') || '/portfolio';

	async function handleSubmit() {
		error = '';

		// Client-side validation
		if (!email) {
			error = "Don't forget your email! 📧";
			return;
		}

		if (!password) {
			error = "Don't forget your password! 🔒";
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.message || 'Something went wrong! Try again 😅';
				loading = false;
				return;
			}

			// Success! Redirect to returnUrl or portfolio
			goto(returnUrl);
		} catch (err) {
			error = 'Something went wrong! Check your connection 📡';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Wrigs Fashion</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-white shadow-2xl">
		<div class="card-body">
			<!-- Header -->
			<div class="text-center mb-6">
				<h1 class="text-4xl font-bold mb-2">
					<span class="text-primary">✨</span>
					Welcome Back!
					<span class="text-primary">✨</span>
				</h1>
				<p class="text-gray-600">Login to continue creating! 🎨</p>
			</div>

			<!-- Login Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<!-- Email Field -->
				<div class="form-control mb-4">
					<label class="label" for="email">
						<span class="label-text font-semibold">📧 Email</span>
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="input input-bordered w-full"
						placeholder="you@example.com"
						disabled={loading}
						autocomplete="email"
					/>
				</div>

				<!-- Password Field -->
				<div class="form-control mb-6">
					<label class="label" for="password">
						<span class="label-text font-semibold">🔒 Password</span>
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="input input-bordered w-full"
						placeholder="Your password"
						disabled={loading}
						autocomplete="current-password"
					/>
					<!-- Forgot Password (V2 Feature) -->
					<label class="label">
						<span class="label-text-alt text-gray-500">Forgot password? Contact support 💬</span>
					</label>
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					class="btn btn-primary w-full text-lg"
					disabled={loading}
				>
					{#if loading}
						<span class="loading loading-spinner"></span>
						Logging in...
					{:else}
						Login 🔑
					{/if}
				</button>
			</form>

			<!-- Register Link -->
			<div class="divider">Don't have an account?</div>
			<a href="/auth/register" class="btn btn-ghost w-full">
				Create Account 🚀
			</a>
		</div>
	</div>
</div>
