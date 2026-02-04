<script lang="ts">
	let {
		catalogId,
		isPublic = false,
		shareSlug = '',
		open = false,
		onclose,
		ontoggle
	}: {
		catalogId: string;
		isPublic?: boolean;
		shareSlug?: string;
		open?: boolean;
		onclose?: () => void;
		ontoggle?: (isPublic: boolean, shareSlug: string) => void;
	} = $props();

	let toggling = $state(false);
	let copied = $state(false);
	let error = $state('');

	let shareUrl = $derived(
		shareSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/catalogs/share/${shareSlug}` : ''
	);

	async function togglePublic() {
		toggling = true;
		error = '';
		try {
			const res = await fetch(`/api/catalogs/${catalogId}/share`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isPublic: !isPublic })
			});
			if (!res.ok) {
				error = 'Failed to update sharing settings';
				toggling = false;
				return;
			}
			const data = await res.json();
			ontoggle?.(data.isPublic, data.shareSlug || '');
		} catch {
			error = 'Failed to update sharing settings';
		}
		toggling = false;
	}

	async function copyLink() {
		if (!shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch {
			// Fallback: select text
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={onclose}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Share Catalog</h3>
				<button class="btn btn-ghost btn-sm btn-circle" onclick={onclose}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			{#if error}
				<div class="alert alert-error text-sm mb-3">{error}</div>
			{/if}

			<div class="toggle-row">
				<div>
					<p class="toggle-label">Make Public</p>
					<p class="toggle-desc">Anyone with the link can view your catalog</p>
				</div>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					checked={isPublic}
					disabled={toggling}
					onchange={togglePublic}
				/>
			</div>

			{#if isPublic && shareUrl}
				<div class="link-section">
					<p class="section-label">Share Link</p>
					<div class="link-row">
						<input
							type="text"
							class="input input-bordered input-sm flex-1"
							value={shareUrl}
							readonly
						/>
						<button class="btn btn-sm" class:btn-success={copied} onclick={copyLink}>
							{copied ? 'Copied!' : 'Copy'}
						</button>
					</div>
				</div>
			{/if}

			<div class="circles-section">
				<p class="section-label">Share to Circles</p>
				<p class="coming-soon">Circle sharing coming soon!</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		width: 100%;
		max-width: 420px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}

	.modal-header h3 {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.toggle-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 10px;
		margin-bottom: 1rem;
	}

	.toggle-label {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.toggle-desc {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.section-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.5rem;
	}

	.link-section {
		margin-bottom: 1rem;
	}

	.link-row {
		display: flex;
		gap: 0.5rem;
	}

	.circles-section {
		border-top: 1px solid #f3f4f6;
		padding-top: 1rem;
	}

	.coming-soon {
		font-size: 0.9rem;
		color: #9ca3af;
		text-align: center;
		padding: 1rem;
	}
</style>
