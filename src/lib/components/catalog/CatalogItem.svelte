<script lang="ts">
	export type CatalogItemData = {
		id: string;
		imageUrl: string;
		positionX: number;
		positionY: number;
		width: number;
		height: number;
		rotation: number;
		zIndex: number;
	};

	let {
		item,
		selected = false,
		readonly = false,
		onselect,
		onupdate,
		ondelete
	}: {
		item: CatalogItemData;
		selected?: boolean;
		readonly?: boolean;
		onselect?: () => void;
		onupdate?: (updates: Partial<CatalogItemData>) => void;
		ondelete?: () => void;
	} = $props();

	let dragging = $state(false);
	let resizing = $state<string | null>(null);
	let rotating = $state(false);
	let dragOffset = { x: 0, y: 0 };
	let startSize = { w: 0, h: 0 };
	let startPos = { x: 0, y: 0 };
	let startAngle = 0;
	let startRotation = 0;

	function getCenterPoint() {
		return {
			x: item.positionX + item.width / 2,
			y: item.positionY + item.height / 2
		};
	}

	function onPointerDown(e: PointerEvent) {
		if (readonly) return;
		e.stopPropagation();
		onselect?.();

		dragging = true;
		dragOffset = {
			x: e.clientX - item.positionX,
			y: e.clientY - item.positionY
		};

		(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
	}

	function onDragMove(e: PointerEvent) {
		if (!dragging) return;
		onupdate?.({
			positionX: e.clientX - dragOffset.x,
			positionY: e.clientY - dragOffset.y
		});
	}

	function onDragEnd() {
		dragging = false;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}

	function onResizeDown(e: PointerEvent, corner: string) {
		if (readonly) return;
		e.stopPropagation();
		e.preventDefault();
		resizing = corner;
		startSize = { w: item.width, h: item.height };
		startPos = { x: e.clientX, y: e.clientY };

		window.addEventListener('pointermove', onResizeMove);
		window.addEventListener('pointerup', onResizeEnd);
	}

	function onResizeMove(e: PointerEvent) {
		if (!resizing) return;
		const dx = e.clientX - startPos.x;
		const dy = e.clientY - startPos.y;

		let newW = startSize.w;
		let newH = startSize.h;

		if (resizing.includes('right')) newW = startSize.w + dx;
		if (resizing.includes('left')) newW = startSize.w - dx;
		if (resizing.includes('bottom')) newH = startSize.h + dy;
		if (resizing.includes('top')) newH = startSize.h - dy;

		// Enforce min/max
		newW = Math.min(Math.max(newW, 80), 800);
		newH = Math.min(Math.max(newH, 80), 800);

		// Aspect ratio lock (shift key)
		if (e.shiftKey) {
			const ratio = startSize.w / startSize.h;
			if (Math.abs(dx) > Math.abs(dy)) {
				newH = newW / ratio;
			} else {
				newW = newH * ratio;
			}
		}

		const updates: Partial<CatalogItemData> = { width: newW, height: newH };

		if (resizing.includes('left')) {
			updates.positionX = item.positionX + (item.width - newW);
		}
		if (resizing.includes('top')) {
			updates.positionY = item.positionY + (item.height - newH);
		}

		onupdate?.(updates);
	}

	function onResizeEnd() {
		resizing = null;
		window.removeEventListener('pointermove', onResizeMove);
		window.removeEventListener('pointerup', onResizeEnd);
	}

	function onRotateDown(e: PointerEvent) {
		if (readonly) return;
		e.stopPropagation();
		e.preventDefault();
		rotating = true;
		const center = getCenterPoint();
		startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
		startRotation = item.rotation;

		window.addEventListener('pointermove', onRotateMove);
		window.addEventListener('pointerup', onRotateEnd);
	}

	function onRotateMove(e: PointerEvent) {
		if (!rotating) return;
		const center = getCenterPoint();
		const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
		const delta = ((angle - startAngle) * 180) / Math.PI;
		onupdate?.({ rotation: startRotation + delta });
	}

	function onRotateEnd() {
		rotating = false;
		window.removeEventListener('pointermove', onRotateMove);
		window.removeEventListener('pointerup', onRotateEnd);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="catalog-item"
	class:selected
	class:dragging
	style="
		left: {item.positionX}px;
		top: {item.positionY}px;
		width: {item.width}px;
		height: {item.height}px;
		transform: rotate({item.rotation}deg);
		z-index: {item.zIndex + (dragging ? 1000 : 0)};
	"
	onpointerdown={onPointerDown}
>
	<img
		src={item.imageUrl}
		alt="Design"
		class="item-image"
		draggable="false"
	/>

	{#if selected && !readonly}
		<!-- Resize handles -->
		{#each ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as corner}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="resize-handle {corner}"
				onpointerdown={(e) => onResizeDown(e, corner)}
			></div>
		{/each}

		<!-- Rotation handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="rotate-handle" onpointerdown={onRotateDown}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
				<path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
			</svg>
		</div>

		<!-- Delete button -->
		<button
			class="delete-btn"
			onclick={(e) => { e.stopPropagation(); ondelete?.(); }}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
				<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.catalog-item {
		position: absolute;
		cursor: grab;
		touch-action: none;
		will-change: transform;
		transition: box-shadow 0.15s;
		border-radius: 4px;
	}

	.catalog-item:hover {
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	}

	.catalog-item.selected {
		outline: 2px solid #a855f7;
		outline-offset: 2px;
		box-shadow: 0 4px 20px rgba(168, 85, 247, 0.25);
	}

	.catalog-item.dragging {
		cursor: grabbing;
		transform: scale(1.02);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
	}

	.item-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 4px;
		pointer-events: none;
		user-select: none;
	}

	.resize-handle {
		position: absolute;
		width: 44px;
		height: 44px;
		background: white;
		border: 2px solid #a855f7;
		border-radius: 50%;
		z-index: 10;
		touch-action: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.resize-handle::after {
		content: '';
		width: 14px;
		height: 14px;
		background: #a855f7;
		border-radius: 50%;
	}

	.resize-handle.top-left { top: -22px; left: -22px; cursor: nwse-resize; }
	.resize-handle.top-right { top: -22px; right: -22px; cursor: nesw-resize; }
	.resize-handle.bottom-left { bottom: -22px; left: -22px; cursor: nesw-resize; }
	.resize-handle.bottom-right { bottom: -22px; right: -22px; cursor: nwse-resize; }

	.rotate-handle {
		position: absolute;
		top: -56px;
		left: 50%;
		transform: translateX(-50%);
		width: 44px;
		height: 44px;
		background: white;
		border: 2px solid #a855f7;
		border-radius: 50%;
		cursor: grab;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #a855f7;
		font-size: 20px;
		z-index: 10;
		touch-action: none;
	}

	.rotate-handle::before {
		content: '';
		position: absolute;
		bottom: -14px;
		left: 50%;
		transform: translateX(-50%);
		width: 2px;
		height: 14px;
		background: #a855f7;
	}

	.delete-btn {
		position: absolute;
		top: -16px;
		right: -16px;
		width: 44px;
		height: 44px;
		background: #f87171;
		border: 2px solid white;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 20px;
		z-index: 10;
		padding: 0;
	}

	.delete-btn:hover {
		background: #ef4444;
		transform: scale(1.1);
	}
</style>
