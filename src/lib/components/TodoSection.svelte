<script lang="ts">
	import TodoRow from './TodoRow.svelte';
	import EmptyState from './EmptyState.svelte';
	import type { Todo, TodoCadence } from '$lib/types/todo';

	interface Props {
		cadence: TodoCadence;
		todos: Todo[];
		onToggle: (id: string) => void;
		onDelete: (id: string) => void;
		onAdd: () => void;
	}

	let { cadence, todos, onToggle, onDelete, onAdd }: Props = $props();

	const title = $derived(
		{ daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[cadence]
	);
	const emptyMessage = $derived(`No ${title.toLowerCase()} tasks yet.`);
	const emptyDetail = $derived(`Add a task to show up in ${title.toLowerCase()} view.`);
</script>

<section class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm">
	<div class="flex items-center justify-between gap-2">
		<h2 class="font-display text-base font-semibold text-[var(--color-muted)]">{title}</h2>
		<button
			type="button"
			class="btn-primary shrink-0 text-sm"
			onclick={onAdd}
			aria-label="Add {title.toLowerCase()} task"
		>
			+ Add
		</button>
	</div>
	{#if todos.length === 0}
		<EmptyState
			message={emptyMessage}
			detail={emptyDetail}
			class="mt-3"
		/>
		<p class="mt-3 text-center">
			<button type="button" class="btn-secondary text-sm" onclick={onAdd}>
				+ Add task
			</button>
		</p>
	{:else}
		<ul class="mt-3 flex flex-col gap-2" role="list">
			{#each todos as todo (todo.id)}
				<li>
					<TodoRow
						{todo}
						onToggle={() => onToggle(todo.id)}
						onDelete={() => onDelete(todo.id)}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</section>
