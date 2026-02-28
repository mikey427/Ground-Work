<script lang="ts">
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import BentoCard from '$lib/components/BentoCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	interface BooksByYear {
		year: number;
		count: number;
	}

	interface Props {
		data: {
			totalFinished: number;
			totalPages: number;
			avgRating: number | null;
			avgDaysToFinish: number | null;
			readingPace: number | null;
			booksByYear: BooksByYear[];
			yearlyGoal: number;
			yearlyProgress: number;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Reading Stats — Ground Work</title>
</svelte:head>

<div class="flex items-center gap-3">
	<a
		href="/reading"
		class="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
	>← Reading</a>
	<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Reading Stats</h1>
</div>

<BentoGrid class="mt-4">
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Books finished</h2>
		<p class="mt-1 text-2xl font-semibold">{data.totalFinished}</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Total pages read</h2>
		<p class="mt-1 text-2xl font-semibold">{data.totalPages.toLocaleString()}</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Average rating</h2>
		<p class="mt-1 text-2xl font-semibold">
			{data.avgRating != null ? `${data.avgRating} / 5` : '—'}
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
			{data.readingPace != null ? `${data.readingPace} pg/day` : '—'}
		</p>
	</BentoCard>
	<BentoCard>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Yearly goal</h2>
		<ProgressBar value={data.yearlyProgress} max={data.yearlyGoal} label="Progress" class="mt-2" />
	</BentoCard>
	{#if data.booksByYear.length > 0}
		<BentoCard colSpan={2}>
			<h2 class="mb-3 text-sm font-medium text-[var(--color-muted)]">Books per year</h2>
			<div class="flex flex-wrap gap-6">
				{#each data.booksByYear as { year, count }}
					<div class="text-center">
						<p class="text-lg font-semibold">{count}</p>
						<p class="text-xs text-[var(--color-muted)]">{year}</p>
					</div>
				{/each}
			</div>
		</BentoCard>
	{/if}
</BentoGrid>
