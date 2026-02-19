<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		label?: string;
		class?: string;
	}

	let { value, max = 100, label, class: className = '' }: Props = $props();

	const pct = $derived(Math.min(100, max > 0 ? (value / max) * 100 : 0));
</script>

<div class="{className}">
	{#if label}
		<div class="mb-1 flex justify-between text-sm">
			<span class="text-[var(--color-muted)]">{label}</span>
			<span class="font-medium">{Math.round(pct)}%</span>
		</div>
	{/if}
	<div
		class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
		role="progressbar"
		aria-valuenow={value}
		aria-valuemin={0}
		aria-valuemax={max}
		aria-label={label}
	>
		<div
			class="h-full rounded-full bg-[var(--color-primary)] transition-all duration-[var(--duration-normal)]"
			style="width: {pct}%"
		></div>
	</div>
</div>
