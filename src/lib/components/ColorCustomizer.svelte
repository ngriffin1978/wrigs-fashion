<script lang="ts">
	import { onMount } from 'svelte';

	let isOpen = $state(false);

	// Current theme colors
	let colors = $state({
		primary: '#E879F9',
		secondary: '#A78BFA',
		accent: '#FDE047',
		success: '#4ADE80',
		info: '#60A5FA',
		warning: '#FB923C',
		error: '#F87171'
	});

	// Pastel color schemes for auto-cycling
	const pastelSchemes = [
		{
			name: 'Soft Lavender Dreams',
			primary: '#E0BBE4',
			secondary: '#D4A5D4',
			accent: '#FEC8D8',
			success: '#B4E7CE'
		},
		{
			name: 'Peachy Cream',
			primary: '#FFD4B8',
			secondary: '#FFC3A0',
			accent: '#FFF4E6',
			success: '#C1E1C1'
		},
		{
			name: 'Mint Sorbet',
			primary: '#B8E6D5',
			secondary: '#A7D8C8',
			accent: '#FFE4E1',
			success: '#9FE2BF'
		},
		{
			name: 'Baby Blue Sky',
			primary: '#BEE3F8',
			secondary: '#B8D4E8',
			accent: '#FFE9D6',
			success: '#C2F0C2'
		},
		{
			name: 'Cotton Candy',
			primary: '#FFB3D9',
			secondary: '#FFC2E2',
			accent: '#FFE5B4',
			success: '#D4F1D4'
		},
		{
			name: 'Lemon Meringue',
			primary: '#FFF8B8',
			secondary: '#FFE9C5',
			accent: '#FFD4E5',
			success: '#D0F0C0'
		},
		{
			name: 'Blush Rose',
			primary: '#FFD6E8',
			secondary: '#FFC5D8',
			accent: '#FFF0E1',
			success: '#C5E3BF'
		},
		{
			name: 'Lilac Breeze',
			primary: '#E6D5FF',
			secondary: '#D8C3F0',
			accent: '#FFEBF0',
			success: '#CCEBC5'
		},
		{
			name: 'Coral Reef',
			primary: '#FFD3D3',
			secondary: '#FFC4C4',
			accent: '#FFF7E0',
			success: '#C3E6CB'
		},
		{
			name: 'Powder Pink',
			primary: '#FFE3E3',
			secondary: '#FFD4D4',
			accent: '#FFF8DC',
			success: '#E0F8E0'
		},
		{
			name: 'Vanilla Sky',
			primary: '#FFF4E0',
			secondary: '#FFE9C9',
			accent: '#FFE4F3',
			success: '#D8F3DC'
		},
		{
			name: 'Bubble Gum',
			primary: '#FFC8DD',
			secondary: '#FFB5D1',
			accent: '#FFE5D9',
			success: '#C8E6C9'
		}
	];

	let currentSchemeIndex = $state(5); // Lemon Meringue
	let isAutoCycling = $state(false);
	let cycleInterval: ReturnType<typeof setInterval> | null = null;
	let cycleSpeed = $state(4500); // milliseconds

	function updateCSSVariables() {
		const root = document.documentElement;
		Object.entries(colors).forEach(([key, value]) => {
			// Convert hex to HSL for DaisyUI
			const hsl = hexToHSL(value);
			root.style.setProperty(`--p`, hsl.primary);
			root.style.setProperty(`--s`, hsl.secondary);
			root.style.setProperty(`--a`, hsl.accent);
		});
	}

	function hexToHSL(hex: string) {
		// Simple conversion for demo - in production use a proper color library
		return {
			primary: '330 81% 74%',
			secondary: '258 90% 66%',
			accent: '54 96% 64%'
		};
	}

	function applyPastelScheme(scheme: typeof pastelSchemes[0]) {
		colors.primary = scheme.primary;
		colors.secondary = scheme.secondary;
		colors.accent = scheme.accent;
		colors.success = scheme.success;
		updateTailwindConfig();
	}

	function nextScheme() {
		currentSchemeIndex = (currentSchemeIndex + 1) % pastelSchemes.length;
		applyPastelScheme(pastelSchemes[currentSchemeIndex]);
	}

	function previousScheme() {
		currentSchemeIndex = (currentSchemeIndex - 1 + pastelSchemes.length) % pastelSchemes.length;
		applyPastelScheme(pastelSchemes[currentSchemeIndex]);
	}

	function toggleAutoCycle() {
		isAutoCycling = !isAutoCycling;

		if (isAutoCycling) {
			cycleInterval = setInterval(nextScheme, cycleSpeed);
		} else {
			if (cycleInterval) {
				clearInterval(cycleInterval);
				cycleInterval = null;
			}
		}
	}

	function startShowcase() {
		isOpen = false;
		isAutoCycling = true;
		cycleInterval = setInterval(nextScheme, cycleSpeed);
	}

	onMount(() => {
		// Apply Lemon Meringue scheme
		applyPastelScheme(pastelSchemes[5]);
		updateTailwindConfig();

		// Keyboard shortcuts
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === ' ' && !isOpen) {
				e.preventDefault();
				toggleAutoCycle();
			} else if (e.key === 'ArrowRight' && !isOpen) {
				e.preventDefault();
				nextScheme();
			} else if (e.key === 'ArrowLeft' && !isOpen) {
				e.preventDefault();
				previousScheme();
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	});

	function updateTailwindConfig() {
		// Update CSS custom properties that affect gradients
		updateCSSVariables();

		// Also update via style injection for immediate feedback
		const style = document.createElement('style');
		style.id = 'custom-theme';
		const existing = document.getElementById('custom-theme');
		if (existing) existing.remove();

		style.textContent = `
			:root {
				--color-primary: ${colors.primary};
				--color-secondary: ${colors.secondary};
				--color-accent: ${colors.accent};
				--color-success: ${colors.success};
			}

			.btn-primary {
				background-color: ${colors.primary} !important;
				border-color: ${colors.primary} !important;
			}

			.text-primary {
				color: ${colors.primary} !important;
			}

			.bg-gradient-to-r.from-primary {
				--tw-gradient-from: ${colors.primary} !important;
			}

			.bg-gradient-to-r.via-secondary {
				--tw-gradient-via: ${colors.secondary} !important;
			}

			.bg-gradient-to-r.to-accent,
			.bg-gradient-to-br.to-accent {
				--tw-gradient-to: ${colors.accent} !important;
			}

			.bg-gradient-to-br.from-primary,
			.from-primary {
				--tw-gradient-from: ${colors.primary} !important;
			}

			.bg-gradient-to-br.to-secondary,
			.to-secondary {
				--tw-gradient-to: ${colors.secondary} !important;
			}

			.from-secondary {
				--tw-gradient-from: ${colors.secondary} !important;
			}

			.from-accent {
				--tw-gradient-from: ${colors.accent} !important;
			}

			.to-success {
				--tw-gradient-to: ${colors.success} !important;
			}

			.border-primary {
				border-color: ${colors.primary} !important;
			}
		`;

		document.head.appendChild(style);
	}

	function exportColors() {
		const config = `
// Copy this to your tailwind.config.js
wrigs: {
	primary: '${colors.primary}',
	secondary: '${colors.secondary}',
	accent: '${colors.accent}',
	info: '${colors.info}',
	success: '${colors.success}',
	warning: '${colors.warning}',
	error: '${colors.error}'
}`;
		navigator.clipboard.writeText(config);
		alert('Color config copied to clipboard! ✨');
	}

	onMount(() => {
		updateTailwindConfig();
	});

	$effect(() => {
		updateTailwindConfig();
	});

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (cycleInterval) {
				clearInterval(cycleInterval);
			}
		};
	});
</script>

<!-- Floating toggle button -->
<button
	onclick={() => (isOpen = !isOpen)}
	class="fixed bottom-6 right-6 z-50 btn btn-circle btn-lg shadow-2xl"
	style="background: linear-gradient(135deg, {colors.primary}, {colors.secondary}); border: none;"
	aria-label="Open color customizer"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="h-6 w-6 text-white"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
		/>
	</svg>
</button>

<!-- Auto-cycle status bar -->
{#if isAutoCycling && !isOpen}
	<div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
			<span class="font-bold text-lg">{pastelSchemes[currentSchemeIndex].name}</span>
		</div>
		<div class="flex gap-2">
			<button onclick={previousScheme} class="btn btn-sm btn-circle" title="Previous">
				←
			</button>
			<button onclick={toggleAutoCycle} class="btn btn-sm" style="background-color: {colors.primary}; color: white; border: none;">
				⏸ Pause
			</button>
			<button onclick={nextScheme} class="btn btn-sm btn-circle" title="Next">
				→
			</button>
		</div>
	</div>
{/if}

<!-- Color Customizer Panel -->
{#if isOpen}
	<div class="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-2xl font-bold">🎨 Color Studio</h3>
			<button onclick={() => (isOpen = false)} class="btn btn-sm btn-circle">✕</button>
		</div>

		<!-- Main Colors -->
		<div class="space-y-4 mb-6">
			<div>
				<label class="label">
					<span class="label-text font-semibold">Primary (Pink)</span>
				</label>
				<div class="flex gap-2 items-center">
					<input
						type="color"
						bind:value={colors.primary}
						class="w-16 h-16 rounded-lg cursor-pointer border-2"
					/>
					<input
						type="text"
						bind:value={colors.primary}
						class="input input-bordered flex-1"
						placeholder="#E879F9"
					/>
				</div>
			</div>

			<div>
				<label class="label">
					<span class="label-text font-semibold">Secondary (Purple)</span>
				</label>
				<div class="flex gap-2 items-center">
					<input
						type="color"
						bind:value={colors.secondary}
						class="w-16 h-16 rounded-lg cursor-pointer border-2"
					/>
					<input
						type="text"
						bind:value={colors.secondary}
						class="input input-bordered flex-1"
						placeholder="#A78BFA"
					/>
				</div>
			</div>

			<div>
				<label class="label">
					<span class="label-text font-semibold">Accent (Yellow)</span>
				</label>
				<div class="flex gap-2 items-center">
					<input
						type="color"
						bind:value={colors.accent}
						class="w-16 h-16 rounded-lg cursor-pointer border-2"
					/>
					<input
						type="text"
						bind:value={colors.accent}
						class="input input-bordered flex-1"
						placeholder="#FDE047"
					/>
				</div>
			</div>

			<div>
				<label class="label">
					<span class="label-text font-semibold">Success (Green)</span>
				</label>
				<div class="flex gap-2 items-center">
					<input
						type="color"
						bind:value={colors.success}
						class="w-16 h-16 rounded-lg cursor-pointer border-2"
					/>
					<input
						type="text"
						bind:value={colors.success}
						class="input input-bordered flex-1"
						placeholder="#4ADE80"
					/>
				</div>
			</div>
		</div>

		<!-- Auto-cycle Controls -->
		<div class="mb-6">
			<div class="flex justify-between items-center mb-3">
				<h4 class="font-bold">🎨 Pastel Showcase</h4>
				<span class="text-sm text-gray-500">{currentSchemeIndex + 1} / {pastelSchemes.length}</span>
			</div>

			<div class="flex gap-2 mb-3">
				<button onclick={previousScheme} class="btn btn-sm flex-1">← Previous</button>
				<button
					onclick={toggleAutoCycle}
					class="btn btn-sm flex-1"
					style="background-color: {isAutoCycling ? colors.error : colors.success}; color: white; border: none;"
				>
					{isAutoCycling ? '⏸ Pause' : '▶ Play'}
				</button>
				<button onclick={nextScheme} class="btn btn-sm flex-1">Next →</button>
			</div>

			<div class="text-center p-4 bg-gray-50 rounded-lg">
				<p class="font-semibold text-lg mb-1">{pastelSchemes[currentSchemeIndex].name}</p>
			</div>
		</div>

		<!-- Speed Control -->
		<div class="mb-6">
			<label class="label">
				<span class="label-text font-semibold">Cycle Speed</span>
			</label>
			<input
				type="range"
				min="500"
				max="5000"
				step="500"
				bind:value={cycleSpeed}
				onchange={() => {
					if (isAutoCycling) {
						toggleAutoCycle();
						toggleAutoCycle();
					}
				}}
				class="range range-primary"
			/>
			<div class="text-xs text-center text-gray-500 mt-1">
				{cycleSpeed}ms ({(cycleSpeed/1000).toFixed(1)}s)
			</div>
		</div>

		<!-- Preview -->
		<div class="mb-4">
			<h4 class="font-bold mb-3">Preview</h4>
			<div
				class="h-24 rounded-lg"
				style="background: linear-gradient(135deg, {colors.primary}, {colors.secondary}, {colors.accent});"
			></div>
		</div>

		<!-- Export Button -->
		<button onclick={exportColors} class="btn btn-block" style="background-color: {colors.primary}; color: white; border: none;">
			📋 Copy Config
		</button>
	</div>
{/if}
