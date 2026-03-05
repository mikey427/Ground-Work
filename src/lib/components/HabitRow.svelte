<script lang="ts">
	import type { Habit } from '$lib/types/habit';

	interface Props {
		habit: Habit;
		completed?: boolean;
		note?: string | null;
		onToggle?: () => void;
		onNoteSave?: (note: string) => void;
		onDelete?: () => void;
		compact?: boolean;
		disabled?: boolean;
		/** When set, the habit name is rendered as a link to this href (e.g. /reading for "Read today"). */
		nameHref?: string;
	}

	let { habit, completed = false, note = null, onToggle, onNoteSave, onDelete, compact = true, disabled = false, nameHref }: Props = $props();

	let noteOpen = $state(false);
	let noteValue = $state('');

	$effect(() => {
		noteValue = note ?? '';
	});

	function saveNote() {
		onNoteSave?.(noteValue);
		noteOpen = false;
	}
</script>

<div class="block">
	<div
		class="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-left transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-primary)]/30 {compact ? 'py-2.5' : 'py-4'}"
	>
		{#if nameHref}
			<button
				type="button"
				class="shrink-0 rounded-[var(--radius-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-[-2px] disabled:opacity-60 disabled:pointer-events-none"
				onclick={onToggle}
				aria-pressed={completed}
				aria-label="{habit.name}: {completed ? 'Done' : 'Not done'}"
				aria-busy={disabled}
				disabled={disabled}
			>
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors {completed
						? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
						: 'border-[var(--color-border)] bg-transparent'}"
					aria-hidden="true"
				>
					{#if completed}
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					{/if}
				</span>
			</button>
			<div class="min-w-0 flex-1">
				<a
					href={nameHref}
					class="block truncate font-medium text-[var(--color-primary)] underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 rounded"
				>{habit.name}</a>
				{#if note && !noteOpen}
					<span class="mt-0.5 block truncate text-sm text-[var(--color-muted)]">{note}</span>
				{/if}
			</div>
		{:else}
			<button
				type="button"
				class="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-card)] text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-[-2px] disabled:opacity-60 disabled:pointer-events-none"
				onclick={onToggle}
				aria-pressed={completed}
				aria-label="{habit.name}: {completed ? 'Done' : 'Not done'}"
				aria-busy={disabled}
				disabled={disabled}
			>
				<span
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors {completed
						? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
						: 'border-[var(--color-border)] bg-transparent'}"
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
					{#if note && !noteOpen}
						<span class="mt-0.5 block truncate text-sm text-[var(--color-muted)]">{note}</span>
					{/if}
				</div>
				{#if habit.category}
					<span class="shrink-0 rounded-full bg-[var(--color-border)]/50 px-2 py-0.5 text-xs text-[var(--color-muted)]">
						{habit.category}
					</span>
				{/if}
			</button>
		{/if}
		{#if nameHref && habit.category}
			<span class="shrink-0 rounded-full bg-[var(--color-border)]/50 px-2 py-0.5 text-xs text-[var(--color-muted)]">
				{habit.category}
			</span>
		{/if}
		{#if onDelete}
			<button
				type="button"
				class="shrink-0 rounded p-1 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/20"
				onclick={onDelete}
				aria-label="Delete {habit.name}"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
			</button>
		{/if}
	</div>

	{#if onNoteSave}
	{#if noteOpen}
		<div class="mt-2 flex gap-2 pl-9">
			<label for="note-{habit.id}" class="sr-only">Note for {habit.name}</label>
			<textarea
				id="note-{habit.id}"
				rows="2"
				placeholder="Optional note…"
				class="input min-h-[2.5rem] flex-1 resize-y"
				bind:value={noteValue}
			></textarea>
			<button type="button" class="btn-secondary shrink-0" onclick={saveNote} disabled={disabled}>Save</button>
		</div>
	{:else}
		<button
			type="button"
			class="mt-1 pl-9 text-left text-sm text-[var(--color-primary)] hover:underline disabled:opacity-60 disabled:pointer-events-none"
			onclick={() => (noteOpen = true)}
			disabled={disabled}
		>
			{note ? 'Edit note' : 'Add note'}
		</button>
	{/if}
	{/if}
</div>
