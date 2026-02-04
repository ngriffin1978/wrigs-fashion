<script lang="ts">
	let {
		title = 'My Fashion Catalog',
		backgroundColor = '#ffffff',
		saveStatus = 'saved',
		ontitlechange,
		onbgchange,
		onshare,
		onback
	}: {
		title?: string;
		backgroundColor?: string;
		saveStatus?: 'saved' | 'saving' | 'error';
		ontitlechange?: (title: string) => void;
		onbgchange?: (color: string) => void;
		onshare?: () => void;
		onback?: () => void;
	} = $props();

	let editing = $state(false);
	let editTitle = $state('');

	const bgColors = [
		'#ffffff',
		'#FFF8B8',
		'#FFE9C5',
		'#FFD4E5',
		'#D0F0C0',
		'#DBEAFE',
		'#F3E8FF',
		'#FEE2E2',
		'#E0F2FE',
		'#F0FDF4'
	];

	function startEditing() {
		editTitle = title;
		editing = true;
	}

	function finishEditing() {
		editing = false;
		if (editTitle.trim() && editTitle !== title) {
			ontitlechange?.(editTitle.trim());
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') finishEditing();
		if (e.key === 'Escape') {
			editTitle = title;
			editing = false;
		}
	}
</script>

<div class="toolbar">
	<div class="toolbar-left">
		<button class="btn btn-ghost btn-sm" onclick={onback}>
			&#8592; Back
		</button>

		<div class="title-area">
			{#if editing}
				<input
					type="text"
					class="input input-bordered input-sm title-input"
					bind:value={editTitle}
					onblur={finishEditing}
					onkeydown={handleKeydown}
					maxlength="200"
				/>
			{:else}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<h2 class="title-text" onclick={startEditing} title="Click to edit">
					{title}
					<svg xmlns="http://www.w3.org/2000/svg" class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
					</svg>
				</h2>
			{/if}
		</div>

		<span class="save-status" class:error={saveStatus === 'error'}>
			{#if saveStatus === 'saving'}
				Saving...
			{:else if saveStatus === 'error'}
				Save failed
			{:else}
				Saved
			{/if}
		</span>
	</div>

	<div class="toolbar-right">
		<div class="color-picker">
			{#each bgColors as color}
				<button
					class="color-swatch"
					class:active={backgroundColor === color}
					style="background-color: {color};"
					title="Background: {color}"
					onclick={() => onbgchange?.(color)}
				></button>
			{/each}
		</div>

		<button class="btn btn-primary btn-sm" onclick={onshare}>
			Share
		</button>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.title-area {
		min-width: 0;
	}

	.title-text {
		font-size: 1.15rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: #374151;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 300px;
	}

	.title-text:hover {
		color: #a855f7;
	}

	.edit-icon {
		opacity: 0.4;
		flex-shrink: 0;
	}

	.title-text:hover .edit-icon {
		opacity: 1;
	}

	.title-input {
		width: 250px;
		font-size: 1rem;
		font-weight: 700;
	}

	.save-status {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.save-status.error {
		color: #f87171;
	}

	.color-picker {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.color-swatch {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid #e5e7eb;
		cursor: pointer;
		padding: 0;
		transition: transform 0.1s;
	}

	.color-swatch:hover {
		transform: scale(1.15);
	}

	.color-swatch.active {
		border-color: #a855f7;
		box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.3);
	}

	@media (max-width: 640px) {
		.toolbar {
			flex-direction: column;
			align-items: stretch;
		}
		.toolbar-left, .toolbar-right {
			justify-content: center;
		}
		.title-text {
			max-width: 200px;
		}
	}
</style>
