<script lang="ts">
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import BentoCard from '$lib/components/BentoCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';

	interface Props {
		data: {
			completionRate: number;
			streakCurrent: number;
			streakLongest: number;
			mostConsistentHabit: string;
			yearlyGoal: number;
			yearlyProgress: number;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Stats — Habit Tracker</title>
</svelte:head>

<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Stats</h1>

<BentoGrid class="mt-4">
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Completion rate</h2>
		<p class="mt-1 text-2xl font-semibold">{data.completionRate}%</p>
		<ProgressBar value={data.completionRate} class="mt-2" />
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Streaks</h2>
		<div class="mt-2">
			<StreakBadge current={data.streakCurrent} longest={data.streakLongest} />
		</div>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Most consistent</h2>
		<p class="mt-1 font-semibold">{data.mostConsistentHabit}</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Yearly goal</h2>
		<ProgressBar value={data.yearlyProgress} max={data.yearlyGoal} label="Progress" class="mt-2" />
	</BentoCard>
</BentoGrid>
