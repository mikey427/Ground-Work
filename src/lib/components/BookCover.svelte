<script lang="ts">
	interface Props {
		coverUrl: string | null;
		title: string;
		class?: string;
	}

	let { coverUrl, title, class: className = '' }: Props = $props();

	const initial = $derived(title.slice(0, 1).toUpperCase());
</script>

<div
	class="flex aspect-[2/3] items-center justify-center overflow-hidden rounded-[var(--radius-input)] bg-[var(--color-border)] text-2xl font-semibold text-[var(--color-muted)] {className}"
>
	{#if coverUrl}
		<img
			src={coverUrl}
			alt=""
			class="h-full w-full object-cover"
			loading="lazy"
		/>
	{:else}
		<span aria-hidden="true">{initial}</span>
	{/if}
</div>
