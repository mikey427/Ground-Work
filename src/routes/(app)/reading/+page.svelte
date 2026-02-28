<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import BookCard from '$lib/components/BookCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import AddBookForm from '$lib/components/AddBookForm.svelte';
	import type { Book } from '$lib/types/book';

	interface Props {
		data: {
			books: Book[];
			byStatus: { reading: Book[]; want: Book[]; finished: Book[]; dnf: Book[] };
		};
	}

	let { data }: Props = $props();

	let tab = $state<'reading' | 'want' | 'finished' | 'dnf'>('reading');
	let addBookOpen = $state(false);
	const tabs = [
		{ id: 'reading' as const, label: 'Currently Reading' },
		{ id: 'want' as const, label: 'Want to Read' },
		{ id: 'finished' as const, label: 'Finished' },
		{ id: 'dnf' as const, label: 'Did Not Finish' }
	];

	const createBookError = $derived(
		($page.data.form as { createBook?: { error?: string } } | undefined)?.createBook?.error ?? null
	);

	async function deleteBook(bookId: string) {
		if (!confirm('Delete this book? This cannot be undone.')) return;
		const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE', credentials: 'include' });
		if (res.ok) await invalidateAll();
	}

	function handleAddBookEnhance() {
		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: (opts?: { invalidateAll?: boolean; reset?: boolean }) => Promise<void>;
		}) => {
			await update();
			if (result.type === 'success') addBookOpen = false;
		};
	}
</script>

<svelte:head>
	<title>Reading — Habit Tracker</title>
</svelte:head>

<div class="flex items-center justify-between gap-2">
	<div class="flex items-center gap-3">
		<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Reading</h1>
		<a
			href="/reading/stats"
			class="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
		>Stats →</a>
	</div>
	<button
		type="button"
		class="btn-primary shrink-0"
		onclick={() => (addBookOpen = true)}
		aria-label="Add book"
	>
		+ Add book
	</button>
</div>

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
		<BookCard {book} showProgress={book.status === 'reading'} onDelete={() => deleteBook(book.id)} />
	{:else}
		<EmptyState
			message="No books here yet."
			detail={tab === 'reading' ? 'Add a book to start tracking.' : undefined}
		/>
		{#if tab === 'want' || tab === 'reading'}
			<p class="mt-4 text-center">
				<button type="button" class="btn-primary" onclick={() => (addBookOpen = true)}>
					+ Add book
				</button>
			</p>
		{/if}
	{/each}
</div>

<Modal open={addBookOpen} title="Add book" onclose={() => (addBookOpen = false)}>
	<form method="POST" action="?/createBook" use:enhance={handleAddBookEnhance}>
		<AddBookForm error={createBookError} />
	</form>
</Modal>
