<script lang="ts">
	import type { Todo } from '$lib/types/todo';

	interface Props {
		todo: Todo;
		onToggle: () => void;
		onDelete?: () => void;
	}

	let { todo, onToggle, onDelete }: Props = $props();

	const cadenceLabel = $derived(
		{ daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[todo.cadence]
	);

	const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const recurrenceLabel = $derived((): string | null => {
		if (!todo.recurring || !todo.recurrenceDetail) return null;
		if (todo.cadence === 'weekly') {
			const d = parseInt(todo.recurrenceDetail);
			return `Every ${DAY_NAMES[d] ?? '?'}`;
		}
		if (todo.cadence === 'monthly') {
			return `Monthly on ${todo.recurrenceDetail}`;
		}
		if (todo.cadence === 'yearly') {
			const [m, d] = todo.recurrenceDetail.split('-');
			return `Every ${MONTH_NAMES[(parseInt(m) - 1)] ?? '?'} ${parseInt(d)}`;
		}
		return null;
	})();
</script>

<div
	class="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-left transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-primary)]/30"
>
	<button
		type="button"
		class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors {todo.completed
			? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
			: 'border-[var(--color-border)] bg-transparent'}"
		onclick={onToggle}
		aria-pressed={todo.completed}
		aria-label="{todo.title}: {todo.completed ? 'Done' : 'Not done'}"
	>
		{#if todo.completed}
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
		{/if}
	</button>
	<div class="min-w-0 flex-1">
		<span class="block truncate font-medium {todo.completed ? 'text-[var(--color-muted)] line-through' : ''}">{todo.title}</span>
		<div class="mt-1 flex flex-wrap items-center gap-1.5">
			<span class="rounded-full bg-[var(--color-border)]/50 px-2 py-0.5 text-xs text-[var(--color-muted)]">
				{cadenceLabel}
			</span>
			{#if todo.recurring}
				<span class="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-xs text-[var(--color-primary)]">
					{recurrenceLabel ?? 'Repeats'}
				</span>
			{/if}
			{#if todo.emailReminder?.enabled}
				<span class="flex items-center gap-0.5 rounded-full bg-[var(--color-border)]/50 px-2 py-0.5 text-xs text-[var(--color-muted)]" title="Email reminder on">
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
					Reminder
				</span>
			{/if}
		</div>
	</div>
	{#if onDelete}
		<button
			type="button"
			class="shrink-0 rounded p-1 text-[var(--color-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
			onclick={(e) => { e.stopPropagation(); onDelete(); }}
			aria-label="Delete {todo.title}"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
		</button>
	{/if}
</div>
