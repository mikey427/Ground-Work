<script lang="ts">
	interface Cell {
		date: string;
		value: number;
		label?: string;
	}

	interface Props {
		cells: Cell[];
		weeks?: number;
		class?: string;
	}

	let { cells, weeks = 12, class: className = '' }: Props = $props();

	const maxValue = $derived(Math.max(1, ...cells.map((c) => c.value)));
	function intensity(value: number): 0 | 1 | 2 | 3 | 4 {
		if (value <= 0) return 0;
		const ratio = value / maxValue;
		if (ratio <= 0.25) return 1;
		if (ratio <= 0.5) return 2;
		if (ratio <= 0.75) return 3;
		return 4;
	}

	const heatClass = (v: number) => {
		const i = intensity(v);
		return [
			'bg-[var(--color-heat-0)]',
			'bg-[var(--color-heat-1)]',
			'bg-[var(--color-heat-2)]',
			'bg-[var(--color-heat-3)]',
			'bg-[var(--color-heat-4)]'
		][i];
	};
</script>

<div class="overflow-x-auto {className}">
	<div
		class="inline-grid gap-1"
		style="grid-template-columns: repeat(7, minmax(0.75rem, 1rem)); grid-auto-rows: minmax(0.75rem, 1rem);"
		role="img"
		aria-label="Activity heatmap"
	>
		{#each cells as cell (cell.date)}
			<div
				class="aspect-square rounded-sm {heatClass(cell.value)}"
				title="{cell.date}{cell.label ? `: ${cell.label}` : ''}"
				role="presentation"
			></div>
		{/each}
	</div>
</div>
