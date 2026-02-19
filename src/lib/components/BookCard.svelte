<script lang="ts">
	import BookCover from '$lib/components/BookCover.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { Book } from '$lib/types/book';

	interface Props {
		book: Book;
		showProgress?: boolean;
	}

	let { book, showProgress = false }: Props = $props();

	const statusLabel = $derived(
		{ reading: 'Reading', want: 'Want to read', finished: 'Finished', dnf: 'Did not finish' }[book.status]
	);
	const progressPct = $derived(
		book.pageCount && book.pageCount > 0 && book.currentPage != null
			? (book.currentPage / book.pageCount) * 100
			: 0
	);
</script>

<a
	href="/reading/{book.id}"
	class="flex gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 transition-colors hover:border-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
>
	<BookCover coverUrl={book.coverUrl} title={book.title} class="h-24 w-16 shrink-0" />
	<div class="min-w-0 flex-1">
		<h3 class="truncate font-medium">{book.title}</h3>
		<p class="truncate text-sm text-[var(--color-muted)]">{book.author}</p>
		<span class="mt-1 inline-block rounded-full bg-[var(--color-border)]/50 px-2 py-0.5 text-xs text-[var(--color-muted)]">
			{statusLabel}
		</span>
		{#if showProgress && progressPct > 0}
			<ProgressBar value={progressPct} class="mt-2" />
		{/if}
	</div>
</a>
