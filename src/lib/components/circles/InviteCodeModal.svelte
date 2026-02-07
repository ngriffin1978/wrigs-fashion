<script lang="ts">
	interface Props {
		circle: any;
		onclose: () => void;
	}

	let { circle, onclose }: Props = $props();
	let copied = $state(false);

	function copyToClipboard() {
		navigator.clipboard.writeText(circle.inviteCode);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="modal modal-open">
	<div class="modal-box">
		<h3 class="font-bold text-2xl mb-4">Circle Created! 🎉</h3>
		<p class="text-gray-600 mb-6">
			Share this invite code with your friends so they can join <strong>{circle.name}</strong>!
		</p>

		<div class="bg-gray-100 rounded-lg p-6 text-center mb-6">
			<label class="label">
				<span class="label-text font-semibold">Invite Code</span>
			</label>
			<div class="text-4xl font-bold text-primary tracking-widest mb-4 font-mono">
				{circle.inviteCode}
			</div>
			<button class="btn btn-primary btn-sm" onclick={copyToClipboard}>
				{#if copied}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Copied!
				{:else}
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
					Copy Code
				{/if}
			</button>
		</div>

		<div class="alert alert-info">
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
			<span class="text-sm">You can find this code again in the circle settings.</span>
		</div>

		<div class="modal-action">
			<button class="btn btn-primary" onclick={onclose}>Got it! 👍</button>
		</div>
	</div>
	<div class="modal-backdrop bg-black bg-opacity-50" onclick={onclose}></div>
</div>
