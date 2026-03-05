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
			booksReadThisYear: number;
			totalPagesRead: number;
			averageRating: number | null;
			avgDaysToFinish: number | null;
			readingPacePagesPerDay: number | null;
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
</BentoGrid>

<h2 class="mt-8 font-display text-lg font-semibold text-[var(--color-muted)]">Reading Stats</h2>
<BentoGrid class="mt-4">
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Books read (this year)</h2>
		<p class="mt-1 text-2xl font-semibold">{data.booksReadThisYear}</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Total pages read</h2>
		<p class="mt-1 text-2xl font-semibold">{data.totalPagesRead}</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Average rating</h2>
		<p class="mt-1 text-2xl font-semibold">
			{data.averageRating != null ? `${Math.round(data.averageRating * 10) / 10} / 5` : '—'}
		</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Avg time to finish</h2>
		<p class="mt-1 text-2xl font-semibold">
			{data.avgDaysToFinish != null ? `${data.avgDaysToFinish} days` : '—'}
		</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Reading pace</h2>
		<p class="mt-1 text-2xl font-semibold">
			{data.readingPacePagesPerDay != null ? `${data.readingPacePagesPerDay} pp/day` : '—'}
		</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Yearly goal</h2>
		<ProgressBar value={data.yearlyProgress} max={data.yearlyGoal} label="Progress" class="mt-2" />
	</BentoCard>
</BentoGrid>
