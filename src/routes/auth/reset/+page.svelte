<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let nickname = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);
	let step = $state(1);

	let passwordStrength = $state(0);

	$effect(() => {
		if (newPassword) {
			let strength = 0;
			if (newPassword.length >= 8) strength++;
			if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) strength++;
			if (/[0-9]/.test(newPassword)) strength++;
			if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
			passwordStrength = Math.min(strength, 3);
		} else {
			passwordStrength = 0;
		}
	});

	function getPasswordStrengthMessage(): string {
		switch (passwordStrength) {
			case 0: return '';
			case 1: return 'Getting there! 🌱';
			case 2: return 'Good password! 🌟';
			case 3: return 'Super secure! 🔒✨';
			default: return '';
		}
	}

	async function handleReset() {
		error = '';

		if (!email && !nickname) {
			error = "We need your email or nickname to find your account! 🔍";
			return;
		}

		if (!newPassword) {
			error = "You need to enter a new password! 🔐";
			return;
		}

		if (newPassword.length < 8) {
			error = "Your password needs at least 8 characters! 🔐";
			return;
		}

		if (newPassword !== confirmPassword) {
			error = "The passwords don't match! Try again 🔄";
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, nickname, newPassword })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.message || 'Something went wrong! Try again 😅';
				loading = false;
				return;
			}

			success = true;
		} catch (err) {
			error = 'Something went wrong! Check your connection 📡';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Reset Password - Wrigs Fashion</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-white shadow-2xl">
		<div class="card-body">
			{#if success}
				<!-- Success State -->
				<div class="text-center">
					<div class="text-6xl mb-4">🎉</div>
					<h1 class="text-2xl font-bold mb-2 text-success">Password Reset!</h1>
					<p class="text-gray-600 mb-6">
						Your password has been changed. You can now log in with your new password!
					</p>
					<a href="/auth/login" class="btn btn-primary btn-lg w-full">
						Go to Login 🔑
					</a>
				</div>
			{:else}
				<!-- Reset Form -->
				<div class="text-center mb-6">
					<h1 class="text-3xl font-bold mb-2">
						<span class="text-primary">🔐</span>
						Reset Password
					</h1>
					<p class="text-gray-600">Forgot your password? No worries! Let's fix it. ✨</p>
				</div>

				<form onsubmit={(e) => { e.preventDefault(); handleReset(); }} action="javascript:void(0)" method="post">
					<!-- Email Field -->
					<div class="form-control mb-4">
						<label class="label" for="email">
							<span class="label-text font-semibold">📧 Email</span>
						</label>
						<input
							type="email"
							id="email"
							name="email"
							bind:value={email}
							class="input input-bordered w-full"
							placeholder="your@email.com"
							disabled={loading}
						/>
						<label class="label">
							<span class="label-text-alt text-gray-500">OR</span>
						</label>
					</div>

					<!-- Nickname Field -->
					<div class="form-control mb-4">
						<label class="label" for="nickname">
							<span class="label-text font-semibold">🎨 Nickname</span>
						</label>
						<input
							type="text"
							id="nickname"
							name="nickname"
							bind:value={nickname}
							class="input input-bordered w-full"
							placeholder="Your nickname"
							disabled={loading}
						/>
						<label class="label">
							<span class="label-text-alt text-gray-500 text-xs">Enter either your email OR nickname to find your account</span>
						</label>
					</div>

					<!-- New Password Field -->
					<div class="form-control mb-4">
						<label class="label" for="newPassword">
							<span class="label-text font-semibold">🔒 New Password</span>
						</label>
						<input
							type="password"
							id="newPassword"
							name="newPassword"
							bind:value={newPassword}
							class="input input-bordered w-full"
							placeholder="At least 8 characters"
							disabled={loading}
							autocomplete="new-password"
						/>
						{#if newPassword.length > 0}
							<div class="mt-2">
								<div class="flex gap-1">
									<div class="h-2 flex-1 rounded" class:bg-success={passwordStrength >= 1} class:bg-gray-200={passwordStrength < 1}></div>
									<div class="h-2 flex-1 rounded" class:bg-success={passwordStrength >= 2} class:bg-gray-200={passwordStrength < 2}></div>
									<div class="h-2 flex-1 rounded" class:bg-success={passwordStrength >= 3} class:bg-gray-200={passwordStrength < 3}></div>
								</div>
								<p class="text-sm mt-1 text-gray-600">{getPasswordStrengthMessage()}</p>
							</div>
						{/if}
					</div>

					<!-- Confirm Password Field -->
					<div class="form-control mb-6">
						<label class="label" for="confirmPassword">
							<span class="label-text font-semibold">🔄 Confirm New Password</span>
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							bind:value={confirmPassword}
							class="input input-bordered w-full"
							placeholder="Type your new password again"
							disabled={loading}
							autocomplete="new-password"
						/>
					</div>

					<!-- Error Message -->
					{#if error}
						<div class="alert alert-error mb-4" role="alert">
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
							Resetting...
						{:else}
							Reset My Password 🔐
						{/if}
					</button>
				</form>

				<div class="divider">OR</div>

				<div class="text-center">
					<p class="text-gray-600 mb-2">Remember your password?</p>
					<a href="/auth/login" class="btn btn-outline">
						Go to Login 🔑
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
