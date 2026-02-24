<script lang="ts">
	import BookCover from '$lib/components/BookCover.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { Book } from '$lib/types/book';

	interface Props {
		book: Book;
		showProgress?: boolean;
		onDelete?: () => void;
	}

	let { book, showProgress = false, onDelete }: Props = $props();

	const statusLabel = $derived(
		{ reading: 'Reading', want: 'Want to read', finished: 'Finished', dnf: 'Did not finish' }[book.status]
	);
	const progressPct = $derived(
		book.pageCount && book.pageCount > 0 && book.currentPage != null
			? (book.currentPage / book.pageCount) * 100
			: 0
	);
</script>

<div
	class="flex gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 transition-colors hover:border-[var(--color-primary)]/30"
	role="listitem"
>
	<a
		href="/reading/{book.id}"
		class="flex min-w-0 flex-1 gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-[-2px] rounded-[var(--radius-card)]"
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
	{#if onDelete}
		<button
			type="button"
			class="shrink-0 self-start rounded p-1 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/20"
			onclick={onDelete}
			aria-label="Delete {book.title}"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
		</button>
	{/if}
</div>
