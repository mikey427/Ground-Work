<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import BentoCard from '$lib/components/BentoCard.svelte';
	import WeekStrip from '$lib/components/WeekStrip.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { Habit } from '$lib/types/habit';
	import { getWeeklyTarget, isHabitDueOnWeekday } from '$lib/habit-frequency.js';

	interface DayState {
		date: string;
		label: string;
		completed: boolean;
		count?: number;
		dueCount?: number;
	}

	interface Props {
		data: {
			days: DayState[];
			habits: Habit[];
			dayDates: string[];
			logByKey: Record<string, { completed: boolean; logId: string }>;
			weekStart: string;
			weekEnd: string;
			today: string;
		};
	}

	let { data }: Props = $props();

	let saving = $state<Record<string, boolean>>({});

	function logKey(habitId: string, date: string) {
		return `${habitId}-${date}`;
	}

	function isCompleted(habitId: string, date: string): boolean {
		const entry = data.logByKey[logKey(habitId, date)];
		return entry?.completed ?? false;
	}

	function getLogId(habitId: string, date: string): string | undefined {
		return data.logByKey[logKey(habitId, date)]?.logId;
	}

	function completedThisWeek(habitId: string): number {
		return data.dayDates.filter((date) => isCompleted(habitId, date)).length;
	}

	function weeklyProgress(habit: Habit): string | null {
		const target = getWeeklyTarget(habit.frequency);
		if (target == null) return null;
		const done = completedThisWeek(habit.id);
		return `${done}/${target}`;
	}

	async function toggle(habitId: string, date: string) {
		const key = logKey(habitId, date);
		if (saving[key]) return;
		const current = isCompleted(habitId, date);
		const next = !current;
		const logId = getLogId(habitId, date);
		saving[key] = true;
		saving = saving;
		try {
			const url = logId ? `/api/habit-logs/${logId}` : '/api/habit-logs';
			const method = logId ? 'PATCH' : 'POST';
			const body = logId
				? JSON.stringify({ completed: next })
				: JSON.stringify({
						habitId: parseInt(habitId, 10),
						date,
						completed: next,
						note: null
					});
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body
			});
			if (!res.ok) return;
			await invalidateAll();
		} finally {
			saving[key] = false;
			saving = saving;
		}
	}

	function weekRangeLabel(start: string, end: string): string {
		const s = new Date(start + 'T12:00:00');
		const e = new Date(end + 'T12:00:00');
		const sameMonth = s.getMonth() === e.getMonth();
		const sameYear = s.getFullYear() === e.getFullYear();
		if (sameMonth && sameYear) {
			return `${s.getDate()}–${e.getDate()} ${s.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
		}
		if (sameYear) {
			return `${s.getDate()} ${s.toLocaleString('default', { month: 'short' })} – ${e.getDate()} ${e.toLocaleString('default', { month: 'short' })} ${e.getFullYear()}`;
		}
		return `${s.toLocaleDateString()} – ${e.toLocaleDateString()}`;
	}
</script>

<svelte:head>
	<title>Week — Habit Tracker</title>
</svelte:head>

<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Week</h1>

<BentoGrid class="mt-4">
	<BentoCard colSpan={4}>
		<h2 class="text-sm font-medium text-[var(--color-muted)]">This week</h2>
		<p class="mt-1 text-xs text-[var(--color-muted)]/80">
			{weekRangeLabel(data.weekStart, data.weekEnd)}
		</p>
		<WeekStrip days={data.days} class="mt-3" />
	</BentoCard>

	{#if data.habits.length === 0}
		<BentoCard colSpan={4}>
			<EmptyState
				message="No habits yet."
				detail="Add habits on Today to see your weekly overview here."
				ctaLabel="Go to Today"
				ctaHref="/"
			/>
		</BentoCard>
	{:else}
		<BentoCard colSpan={4}>
			<h2 class="text-sm font-medium text-[var(--color-muted)]">By habit</h2>
			<p class="mt-1 text-xs text-[var(--color-muted)]/80">
				Tap a day to mark that habit done or undone.
			</p>
			<div class="mt-3 overflow-x-auto">
				<table class="w-full min-w-[320px] border-collapse text-left" role="grid">
					<thead>
						<tr>
							<th scope="col" class="pb-2 pr-2 text-xs font-medium text-[var(--color-muted)]">
								Habit
							</th>
							{#each data.days as day (day.date)}
								<th
									scope="col"
									class="pb-2 px-1 text-center text-xs font-medium text-[var(--color-muted)] {day.date === data.today
										? 'ring-1 ring-[var(--color-primary)]/30 rounded-[var(--radius-input)]'
										: ''}"
								>
									{day.label}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data.habits as habit (habit.id)}
							{@const progress = weeklyProgress(habit)}
							<tr class="border-t border-[var(--color-border)]">
								<td class="py-2 pr-2">
									<span class="block truncate font-medium text-[var(--color-muted)]" title={habit.name}>
										{habit.name}
									</span>
									{#if progress}
										<span class="block truncate text-xs text-[var(--color-muted)]/80" aria-label="This week: {progress}">{progress}</span>
									{/if}
								</td>
								{#each data.dayDates as date, dayIndex}
									{@const key = logKey(habit.id, date)}
									{@const completed = isCompleted(habit.id, date)}
									{@const isToday = date === data.today}
									{@const isDue = isHabitDueOnWeekday(habit.frequency, dayIndex)}
									<td class="p-1 text-center align-middle">
										<button
											type="button"
											class="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50 {!isDue && !completed
												? 'opacity-50 border-[var(--color-border)]/60 bg-[var(--color-surface)]'
												: ''} {completed
												? 'border-[var(--color-success)] bg-[var(--color-success)] text-white opacity-100'
												: 'bg-[var(--color-surface-elevated)] hover:border-[var(--color-primary)]/40'} {isToday
												? 'ring-1 ring-[var(--color-primary)]/20'
												: ''}"
											aria-pressed={completed}
											aria-label="{habit.name}, {date}: {isDue ? (completed ? 'Done' : 'Not done') : 'Optional (not required this day)'}"
											disabled={saving[key] ?? false}
											onclick={() => toggle(habit.id, date)}
										>
											{#if completed}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2.5"
													stroke-linecap="round"
													stroke-linejoin="round"
													aria-hidden="true"
												>
													<polyline points="20 6 9 17 4 12" />
												</svg>
											{:else}
												<span class="sr-only">Mark done</span>
											{/if}
										</button>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</BentoCard>
	{/if}
</BentoGrid>
