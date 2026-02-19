<script lang="ts">
	import HabitRow from '$lib/components/HabitRow.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { Habit } from '$lib/types/habit';

	interface Props {
		data: {
			habits: Habit[];
			completedByHabitId: Record<string, boolean>;
			noteByHabitId: Record<string, string>;
		};
	}

	let { data }: Props = $props();

	// Client-side toggle until form action is wired; initial from load data (once)
	let completed = $state<Record<string, boolean>>({});
	let initialized = $state(false);
	$effect(() => {
		if (!initialized && data.habits.length > 0) {
			completed = Object.fromEntries(data.habits.map((h) => [h.id, !!data.completedByHabitId[h.id]]));
			initialized = true;
		}
	});

	function toggle(habitId: string) {
		completed[habitId] = !completed[habitId];
		completed = completed;
	}
</script>

<svelte:head>
	<title>Today — Habit Tracker</title>
</svelte:head>

<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Today</h1>

{#if data.habits.length === 0}
	<EmptyState
		message="No habits yet."
		detail="Add habits to start tracking your daily progress."
		class="mt-4"
	/>
{:else}
	<ul class="mt-4 flex flex-col gap-2" role="list">
		{#each data.habits as habit (habit.id)}
			<li>
				<HabitRow
					{habit}
					completed={completed[habit.id] ?? false}
					note={data.noteByHabitId[habit.id] ?? null}
					onToggle={() => toggle(habit.id)}
				/>
			</li>
		{/each}
	</ul>

	<p class="mt-4 text-sm">
		<a href="/reading" class="text-[var(--color-primary)] underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">Read today</a> →
	</p>
{/if}
