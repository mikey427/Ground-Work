<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import AddHabitForm from '$lib/components/AddHabitForm.svelte';
	import type { Habit } from '$lib/types/habit';

	interface Props {
		data: {
			today: string;
			habits: Habit[];
			completedByHabitId: Record<string, boolean>;
			noteByHabitId: Record<string, string>;
			logIdByHabitId: Record<string, string>;
		};
	}

	let { data }: Props = $props();

	let addHabitOpen = $state(false);
	let saving = $state<Record<string, boolean>>({});

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
					onNoteSave={(note) => saveNote(habit.id, note)}
					onDelete={() => deleteHabit(habit.id)}
					disabled={saving[habit.id] ?? false}
				/>
			</li>
		{/each}
	</ul>

	<p class="mt-4 text-sm">
		<a href="/reading" class="text-[var(--color-primary)] underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">Read today</a> →
	</p>
{/if}

<Modal open={addHabitOpen} title="Add habit" onclose={() => (addHabitOpen = false)}>
	<form method="POST" action="?/createHabit" use:enhance={handleAddHabitEnhance}>
		<AddHabitForm />
	</form>
</Modal>
