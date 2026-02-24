<script lang="ts">
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import BentoCard from '$lib/components/BentoCard.svelte';
	import HeatmapGrid from '$lib/components/HeatmapGrid.svelte';
	import { dateRangeLabel } from '$lib/date-utils.js';

	interface HeatmapCell {
		date: string;
		value: number;
		label?: string;
	}

	interface Props {
		data: {
			cells: HeatmapCell[];
			rangeStart: string;
			rangeEnd: string;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Month — Habit Tracker</title>
</svelte:head>

<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Month</h1>

<BentoGrid class="mt-4">
	<BentoCard colSpan={4}>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Activity</h2>
		<p class="mt-1 text-xs text-[var(--color-muted)]/80">
			{dateRangeLabel(data.rangeStart, data.rangeEnd)}
		</p>
		<HeatmapGrid cells={data.cells} class="mt-3" />
	</BentoCard>
</BentoGrid>
