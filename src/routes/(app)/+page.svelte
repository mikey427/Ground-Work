<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import AddHabitForm from '$lib/components/AddHabitForm.svelte';
	import type { Habit } from '$lib/types/habit';

	const moodOptions = [
		{ value: 1, label: 'Very low', icon: '😞' },
		{ value: 2, label: 'Low', icon: '🙁' },
		{ value: 3, label: 'Okay', icon: '😐' },
		{ value: 4, label: 'Good', icon: '🙂' },
		{ value: 5, label: 'Great', icon: '😄' }
	] as const;

	interface Props {
		data: {
			today: string;
			habits: Habit[];
			completedByHabitId: Record<string, boolean>;
			noteByHabitId: Record<string, string>;
			logIdByHabitId: Record<string, string>;
			readTodayLogId: number | null;
			moodRating: number | null;
			moodNote: string | null;
		};
	}

	let { data }: Props = $props();

	let addHabitOpen = $state(false);
	let saving = $state<Record<string, boolean>>({});
	let selectedMood = $state<number | null>(data.moodRating);

	let completed = $state<Record<string, boolean>>({});
	let noteByHabitId = $state<Record<string, string>>({});
	let initialized = $state(false);
	$effect(() => {
		if (!initialized && data.habits.length >= 0) {
			completed = Object.fromEntries(data.habits.map((h) => [h.id, !!data.completedByHabitId[h.id]]));
			noteByHabitId = { ...data.noteByHabitId };
			initialized = true;
		}
	});

	async function toggle(habitId: string) {
		const next = !(completed[habitId] ?? false);
		completed[habitId] = next;
		completed = completed;
		saving[habitId] = true;
		saving = saving;
		try {
			if (habitId === 'read-today') {
				const body: { date: string; completed: boolean; logId?: number } = {
					date: data.today,
					completed: next
				};
				if (!next && data.readTodayLogId != null) body.logId = data.readTodayLogId;
				const res = await fetch('/api/read-today', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					completed[habitId] = !next;
					completed = completed;
					return;
				}
				await invalidateAll();
				return;
			}
			const logId = data.logIdByHabitId[habitId];
			const url = logId ? `/api/habit-logs/${logId}` : '/api/habit-logs';
			const method = logId ? 'PATCH' : 'POST';
			const body = logId
				? JSON.stringify({ completed: next })
				: JSON.stringify({
						habitId: parseInt(habitId, 10),
						date: data.today,
						completed: next,
						note: noteByHabitId[habitId] ?? null
					});
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body
			});
			if (!res.ok) {
				completed[habitId] = !next;
				completed = completed;
				return;
			}
			await invalidateAll();
		} finally {
			saving[habitId] = false;
			saving = saving;
		}
	}

	async function saveNote(habitId: string, note: string) {
		noteByHabitId[habitId] = note;
		noteByHabitId = noteByHabitId;
		saving[habitId] = true;
		saving = saving;
		try {
			const logId = data.logIdByHabitId[habitId];
			const url = logId ? `/api/habit-logs/${logId}` : '/api/habit-logs';
			const method = logId ? 'PATCH' : 'POST';
			const body = logId
				? JSON.stringify({ note: note || null })
				: JSON.stringify({
						habitId: parseInt(habitId, 10),
						date: data.today,
						completed: completed[habitId] ?? false,
						note: note || null
					});
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body
			});
			if (!res.ok) return;
			await invalidateAll();
		} finally {
			saving[habitId] = false;
			saving = saving;
		}
	}

	async function deleteHabit(habitId: string) {
		if (!confirm('Delete this habit? This cannot be undone.')) return;
		const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE', credentials: 'include' });
		if (res.ok) await invalidateAll();
	}

	function handleAddHabitEnhance() {
		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: (opts?: { invalidateAll?: boolean; reset?: boolean }) => Promise<void>;
		}) => {
			await update();
			if (result.type === 'success') addHabitOpen = false;
		};
	}
</script>

<svelte:head>
	<title>Today — Habit Tracker</title>
</svelte:head>

<div class="flex items-center justify-between gap-2">
	<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Today</h1>
	<button
		type="button"
		class="btn-primary shrink-0"
		onclick={() => (addHabitOpen = true)}
		aria-label="Add habit"
	>
		+ Add habit
	</button>
</div>

{#if data.habits.length === 0}
	<EmptyState
		message="No habits yet."
		detail="Add habits to start tracking your daily progress."
		class="mt-4"
	/>
	<p class="mt-4 text-center">
		<button type="button" class="btn-primary" onclick={() => (addHabitOpen = true)}>
			+ Add habit
		</button>
	</p>
{:else}
	<ul class="mt-4 flex flex-col gap-2" role="list">
		{#each data.habits as habit (habit.id)}
			<li>
				<HabitRow
					{habit}
					completed={completed[habit.id] ?? false}
					note={noteByHabitId[habit.id] ?? data.noteByHabitId[habit.id] ?? null}
					onToggle={() => toggle(habit.id)}
					onNoteSave={habit.id === 'read-today' ? undefined : (note) => saveNote(habit.id, note)}
					onDelete={habit.id === 'read-today' ? undefined : () => deleteHabit(habit.id)}
					disabled={saving[habit.id] ?? false}
					nameHref={habit.id === 'read-today' ? '/reading' : undefined}
				/>
			</li>
		{/each}
	</ul>
{/if}

<section
	class="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
	aria-labelledby="today-mood-heading"
>
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2
				id="today-mood-heading"
				class="text-sm font-medium text-[var(--color-muted)]"
			>
				Today’s mood
			</h2>
			<p class="mt-1 text-xs text-[var(--color-muted)]/80">
				How are you feeling overall today?
			</p>
		</div>
		{#if data.moodRating != null}
			<p class="text-xs text-[var(--color-muted)]/80">
				Logged as
				<span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs font-medium">
					{#each moodOptions as opt}
						{#if opt.value === data.moodRating}
							<span aria-hidden="true">{opt.icon}</span>
							<span>{opt.label}</span>
						{/if}
					{/each}
				</span>
			</p>
		{/if}
	</div>

	<form method="POST" action="?/saveMood" class="mt-4 space-y-3">
		<fieldset>
			<legend class="sr-only">Select mood rating from 1 to 5</legend>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs text-[var(--color-muted)]/80">Mood:</span>
				<div class="flex gap-1">
					{#each moodOptions as opt}
						{@const selected = selectedMood === opt.value}
						<label
							class="inline-flex cursor-pointer items-center justify-center rounded-full border px-3 py-1.5 text-sm transition-colors transition-transform {selected
								? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm scale-105'
								: 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]/80 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-muted)]'}"
						>
							<input
								type="radio"
								name="rating"
								value={opt.value}
								class="sr-only"
								checked={selected}
								onchange={() => (selectedMood = opt.value)}
								aria-label={opt.label}
							/>
							<span class="mr-1 text-lg" aria-hidden="true">{opt.icon}</span>
							<span class="hidden text-xs sm:inline font-medium">{opt.value}</span>
						</label>
					{/each}
				</div>
			</div>
		</fieldset>

		<div>
			<label for="mood-note" class="block text-xs font-medium text-[var(--color-muted)]">
				Notes
			</label>
			<p class="mt-1 text-[0.7rem] text-[var(--color-muted)]/80">
				Optional: jot down anything about how your day is going.
			</p>
			<textarea
				id="mood-note"
				name="note"
				rows="3"
				class="mt-1 block w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-muted)] shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
				placeholder="Today has been..."
			>{data.moodNote ?? ''}</textarea>
		</div>

		<div class="flex justify-end">
			<button type="submit" class="btn-primary">
				Save mood
			</button>
		</div>
	</form>
</section>

<Modal open={addHabitOpen} title="Add habit" onclose={() => (addHabitOpen = false)}>
	<form method="POST" action="?/createHabit" use:enhance={handleAddHabitEnhance}>
		<AddHabitForm />
	</form>
</Modal>
