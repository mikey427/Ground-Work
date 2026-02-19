<script lang="ts">
	interface Props {
		colSpan?: 1 | 2 | 3 | 4;
		rowSpan?: 1 | 2;
		class?: string;
		children: import('svelte').Snippet;
	}

	let { colSpan = 1, rowSpan = 1, class: className = '', children }: Props = $props();

	const colSpanClass = $derived(
		{ 1: '', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4' }[colSpan]
	);
	const rowSpanClass = $derived({ 1: '', 2: 'md:row-span-2' }[rowSpan]);
</script>

<div
	class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm {colSpanClass} {rowSpanClass} {className}"
>
	{@render children()}
</div>
