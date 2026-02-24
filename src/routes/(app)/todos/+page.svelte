<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import TodoSection from '$lib/components/TodoSection.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import AddTodoForm from '$lib/components/AddTodoForm.svelte';
	import type { Todo, TodoCadence, EmailReminderWhen } from '$lib/types/todo';

	interface Props {
		data: { todos: Todo[] };
	}

	let { data }: Props = $props();

	let addModalOpen = $state(false);
	let addModalCadence = $state<TodoCadence>('daily');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const dailyTodos = $derived(data.todos.filter((t) => t.cadence === 'daily'));
	const weeklyTodos = $derived(data.todos.filter((t) => t.cadence === 'weekly'));
	const monthlyTodos = $derived(data.todos.filter((t) => t.cadence === 'monthly'));
	const yearlyTodos = $derived(data.todos.filter((t) => t.cadence === 'yearly'));

	function openAdd(cadence: TodoCadence) {
		addModalCadence = cadence;
		addModalOpen = true;
		error = null;
	}

	async function toggleTodo(id: string) {
		const t = data.todos.find((x) => x.id === id);
		if (!t) return;
		const completed = !t.completed;
		const completedAt = completed ? new Date().toISOString() : null;
		submitting = true;
		error = null;
		try {
			const res = await fetch(`/api/todos/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completed, completedAt })
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				error = (err as { error?: string }).error ?? 'Failed to update';
				return;
			}
			await invalidateAll();
		} finally {
			submitting = false;
		}
	}

	async function deleteTodo(id: string) {
		submitting = true;
		error = null;
		try {
			const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				error = (err as { error?: string }).error ?? 'Failed to delete';
				return;
			}
			await invalidateAll();
		} finally {
			submitting = false;
		}
	}

	async function handleAddSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const fd = new FormData(form);
		const title = (fd.get('title') as string)?.trim();
		if (!title) return;
		const cadence = (fd.get('cadence') as TodoCadence) || 'daily';
		const recurring = fd.get('recurring') === '1';
		const emailReminderEnabled = fd.get('emailReminderEnabled') === '1';
		const emailReminderWhen = (fd.get('emailReminderWhen') as EmailReminderWhen) || 'at_time';
		const emailReminderValue = fd.get('emailReminderValue') as string | null;

		const body = {
			title,
			cadence,
			recurring,
			completed: false,
			emailReminder: {
				enabled: emailReminderEnabled,
				when: emailReminderWhen,
				value:
					emailReminderWhen === 'day_before'
						? undefined
						: emailReminderValue ?? (emailReminderWhen === 'at_time' ? '09:00' : 30)
			}
		};

		submitting = true;
		error = null;
		try {
			const res = await fetch('/api/todos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const json = await res.json().catch(() => ({}));
			if (!res.ok) {
				error = (json as { error?: string }).error ?? 'Failed to add task';
				return;
			}
			addModalOpen = false;
			form.reset();
			await invalidateAll();
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Todos — Habit Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Todos</h1>
	<p class="text-sm text-[var(--color-muted)]">
		Tasks by cadence. Add repeating tasks and set email reminders.
	</p>

	{#if error}
		<p class="rounded-[var(--radius-input)] bg-red-500/10 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>
	{/if}

	<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
		<TodoSection
			cadence="daily"
			todos={dailyTodos}
			onToggle={toggleTodo}
			onDelete={deleteTodo}
			onAdd={() => openAdd('daily')}
		/>
		<TodoSection
			cadence="weekly"
			todos={weeklyTodos}
			onToggle={toggleTodo}
			onDelete={deleteTodo}
			onAdd={() => openAdd('weekly')}
		/>
		<TodoSection
			cadence="monthly"
			todos={monthlyTodos}
			onToggle={toggleTodo}
			onDelete={deleteTodo}
			onAdd={() => openAdd('monthly')}
		/>
		<TodoSection
			cadence="yearly"
			todos={yearlyTodos}
			onToggle={toggleTodo}
			onDelete={deleteTodo}
			onAdd={() => openAdd('yearly')}
		/>
	</div>
</div>

<Modal open={addModalOpen} title="Add task" onclose={() => (addModalOpen = false)}>
	<form onsubmit={handleAddSubmit}>
		<AddTodoForm cadence={addModalCadence} error={error} disabled={submitting} submitLabel={submitting ? 'Adding…' : 'Add task'} />
	</form>
</Modal>
