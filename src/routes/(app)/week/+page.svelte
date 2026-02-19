<script lang="ts">
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import BentoCard from '$lib/components/BentoCard.svelte';
	import WeekStrip from '$lib/components/WeekStrip.svelte';

	interface Props {
		data: { days: { date: string; label: string; completed: boolean; count?: number }[] };
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Week — Habit Tracker</title>
</svelte:head>

<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Week</h1>

<BentoGrid class="mt-4">
	<BentoCard colSpan={4}>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">This week</h2>
		<WeekStrip days={data.days} class="mt-3" />
	</BentoCard>
</BentoGrid>
