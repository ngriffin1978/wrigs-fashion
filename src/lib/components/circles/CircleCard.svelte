<script lang="ts">
	interface Props {
		circle: any;
	}

	let { circle }: Props = $props();

	function formatDate(dateInput: string | Date): string {
		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString();
	}
</script>

<a
	href="/circles/{circle.id}"
	class="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
>
	<div class="card-body">
		<div class="flex justify-between items-start">
			<h3 class="card-title text-xl truncate flex-1">{circle.name}</h3>
			{#if circle.isOwner}
				<div class="badge badge-primary badge-sm">Owner</div>
			{:else}
				<div class="badge badge-secondary badge-sm">Member</div>
			{/if}
		</div>

		<div class="flex items-center gap-2 text-sm text-gray-600 mt-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
			<span>{circle.memberCount || 0} member{circle.memberCount !== 1 ? 's' : ''}</span>
		</div>

		<div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>Created {formatDate(circle.createdAt)}</span>
		</div>
	</div>
</a>
