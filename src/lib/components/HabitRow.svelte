<script lang="ts">
	import type { Habit } from '$lib/types/habit';

	interface Props {
		habit: Habit;
		completed?: boolean;
		note?: string | null;
		onToggle?: () => void;
		compact?: boolean;
	}

	let { habit, completed = false, note = null, onToggle, compact = true }: Props = $props();
</script>

<button
	type="button"
	class="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-left transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 {compact ? 'py-2.5' : 'py-4'}"
	onclick={onToggle}
	aria-pressed={completed}
	aria-label="{habit.name}: {completed ? 'Done' : 'Not done'}"
>
	<span
		class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors {completed
			? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
			: 'border-[var(--color-border)] bg-transparent'}"
		style="--habit-color: {habit.color}"
		aria-hidden="true"
	>
		{#if completed}
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
		{/if}
	</span>
	<div class="min-w-0 flex-1">
		<span class="block truncate font-medium">{habit.name}</span>
		{#if note}
			<span class="mt-0.5 block truncate text-sm text-[var(--color-muted)]">{note}</span>
		{/if}
	</div>
	{#if habit.category}
		<span class="shrink-0 rounded-full bg-[var(--color-border)]/50 px-2 py-0.5 text-xs text-[var(--color-muted)]">
			{habit.category}
		</span>
	{/if}
</button>
