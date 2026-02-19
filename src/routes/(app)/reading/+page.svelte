<script lang="ts">
	import BookCard from '$lib/components/BookCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { Book } from '$lib/types/book';

	interface Props {
		data: {
			books: Book[];
			byStatus: { reading: Book[]; want: Book[]; finished: Book[]; dnf: Book[] };
		};
	}

	let { data }: Props = $props();

	let tab = $state<'reading' | 'want' | 'finished' | 'dnf'>('reading');
	const tabs = [
		{ id: 'reading' as const, label: 'Currently Reading' },
		{ id: 'want' as const, label: 'Want to Read' },
		{ id: 'finished' as const, label: 'Finished' },
		{ id: 'dnf' as const, label: 'Did Not Finish' }
	];
</script>

<svelte:head>
	<title>Reading — Habit Tracker</title>
</svelte:head>

<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Reading</h1>

<div class="mt-4 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-2">
	{#each tabs as t}
		<button
			type="button"
			class="shrink-0 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium transition-colors {tab === t.id
				? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
				: 'text-[var(--color-muted)] hover:bg-[var(--color-border)]/50'}"
			onclick={() => (tab = t.id)}
		>
			{t.label}
		</button>
	{/each}
</div>

<div class="mt-4 flex flex-col gap-3">
	{#each data.byStatus[tab] as book (book.id)}
		<BookCard {book} showProgress={book.status === 'reading'} />
	{:else}
		<EmptyState
			message="No books here yet."
			detail={tab === 'reading' ? 'Add a book to start tracking.' : undefined}
		/>
	{/each}
</div>
