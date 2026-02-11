<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let nickname = $state('');
	let loading = $state(false);
	let errors = $state<Record<string, string>>({});
	let passwordStrength = $state(0);

	// Calculate password strength reactively
	$effect(() => {
		if (password) {
			let strength = 0;
			if (password.length >= 8) strength++;
			if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
			if (/[0-9]/.test(password)) strength++;
			if (/[^A-Za-z0-9]/.test(password)) strength++;
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

	async function handleSubmit() {
		errors = {};

		// Client-side validation
		if (!email) {
			errors.email = "We need your email to create your account! 📧";
			return;
		}

		if (!password) {
			errors.password = "You need a password to keep your account safe! 🔒";
			return;
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = "Passwords don't match! Try again 🔄";
			return;
		}

		if (!nickname) {
			errors.nickname = "What should we call you? Pick a cool nickname! 🎨";
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, nickname })
			});

			const data = await response.json();

			if (!response.ok) {
				errors.general = data.message || 'Something went wrong! Try again 😅';
				loading = false;
				return;
			}

			// Success! Redirect to onboarding
			goto('/onboarding');
		} catch (error) {
			errors.general = 'Something went wrong! Check your connection 📡';
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-white shadow-2xl">
		<div class="card-body">
			<!-- Header -->
			<div class="text-center mb-6">
				<h1 class="text-4xl font-bold mb-2">
					<span class="text-primary">✨</span>
					Join Wrigs Fashion!
					<span class="text-primary">✨</span>
				</h1>
				<p class="text-gray-600">Create your account and start designing! 🎨</p>
			</div>

			<!-- Registration Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
						class:input-error={errors.email}
						placeholder="you@example.com"
						disabled={loading}
					/>
					{#if errors.email}
						<label class="label">
							<span class="label-text-alt text-error">{errors.email}</span>
						</label>
					{/if}
				</div>

				<!-- Password Field -->
				<div class="form-control mb-4">
					<label class="label" for="password">
						<span class="label-text font-semibold">🔒 Password</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						class="input input-bordered w-full"
						class:input-error={errors.password}
						placeholder="At least 8 characters"
						disabled={loading}
					/>
					{#if errors.password}
						<label class="label">
							<span class="label-text-alt text-error">{errors.password}</span>
						</label>
					{/if}

					<!-- Password Strength Indicator -->
					{#if password.length > 0}
						<div class="mt-2">
							<div class="flex gap-1">
								<div class="h-2 flex-1 rounded bg-{passwordStrength >= 1 ? 'success' : 'gray-200'}"></div>
								<div class="h-2 flex-1 rounded bg-{passwordStrength >= 2 ? 'success' : 'gray-200'}"></div>
								<div class="h-2 flex-1 rounded bg-{passwordStrength >= 3 ? 'success' : 'gray-200'}"></div>
							</div>
							<p class="text-sm mt-1 text-gray-600">{getPasswordStrengthMessage()}</p>
						</div>
					{/if}
				</div>

				<!-- Confirm Password Field -->
				<div class="form-control mb-4">
					<label class="label" for="confirmPassword">
						<span class="label-text font-semibold">🔄 Confirm Password</span>
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						bind:value={confirmPassword}
						class="input input-bordered w-full"
						class:input-error={errors.confirmPassword}
						placeholder="Type your password again"
						disabled={loading}
					/>
					{#if errors.confirmPassword}
						<label class="label">
							<span class="label-text-alt text-error">{errors.confirmPassword}</span>
						</label>
					{/if}
				</div>

				<!-- Nickname Field -->
				<div class="form-control mb-6">
					<label class="label" for="nickname">
						<span class="label-text font-semibold">🎨 Nickname</span>
					</label>
					<input
						type="text"
						id="nickname"
						name="nickname"
						bind:value={nickname}
						class="input input-bordered w-full"
						class:input-error={errors.nickname}
						placeholder="What should we call you?"
						disabled={loading}
						maxlength="20"
					/>
					{#if errors.nickname}
						<label class="label">
							<span class="label-text-alt text-error">{errors.nickname}</span>
						</label>
					{/if}
				</div>

				<!-- General Error -->
				{#if errors.general}
					<div class="alert alert-error mb-4">
						<span>{errors.general}</span>
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
						Creating your account...
					{:else}
						Create Account 🚀
					{/if}
				</button>
			</form>

			<!-- Login Link -->
			<div class="divider">Already have an account?</div>
			<a href="/auth/login" class="btn btn-ghost w-full">
				Login Instead 🔑
			</a>

			<!-- Parent Notice -->
			<div class="text-center text-sm text-gray-500 mt-4">
				<p>By signing up, you agree to our <a href="/terms" class="link">Terms</a> and <a href="/privacy" class="link">Privacy Policy</a>.</p>
				<p class="mt-2">👨‍👩‍👧 Parents: We take your child's safety seriously.</p>
			</div>
		</div>
	</div>
</div>
