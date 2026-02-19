<script lang="ts">
	import BookCover from '$lib/components/BookCover.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { Book } from '$lib/types/book';

	interface Props {
		data: { book: Book | null };
	}

	let { data }: Props = $props();

	const progressPct = $derived(
		data.book?.pageCount && data.book.pageCount > 0 && data.book.currentPage != null
			? (data.book.currentPage / data.book.pageCount) * 100
			: 0
	);
</script>

<svelte:head>
	<title>{data.book?.title ?? 'Book'} — Habit Tracker</title>
</svelte:head>

{#if data.book}
	<a href="/reading" class="mb-4 inline-block text-sm text-[var(--color-primary)] hover:underline">← Reading</a>

	<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
		<BookCover coverUrl={data.book.coverUrl} title={data.book.title} class="h-48 w-32 shrink-0 sm:h-64 sm:w-40" />
		<div class="min-w-0 flex-1">
			<h1 class="font-display text-2xl font-semibold">{data.book.title}</h1>
			<p class="mt-1 text-[var(--color-muted)]">{data.book.author}</p>
			{#if data.book.genre}
				<p class="mt-1 text-sm text-[var(--color-muted)]">{data.book.genre}</p>
			{/if}
			{#if data.book.startDate}
				<p class="mt-2 text-sm text-[var(--color-muted)]">Started {data.book.startDate}</p>
			{/if}
			{#if data.book.finishDate}
				<p class="text-sm text-[var(--color-muted)]">Finished {data.book.finishDate}</p>
			{/if}
			{#if data.book.rating != null}
				<p class="mt-1 text-sm">Rating: {data.book.rating}/5</p>
			{/if}
			{#if data.book.status === 'reading' && data.book.pageCount && data.book.currentPage != null}
				<div class="mt-4">
					<ProgressBar
						value={data.book.currentPage}
						max={data.book.pageCount}
						label="Progress"
					/>
				</div>
			{/if}
		</div>
	</div>

	{#if data.book.thoughts}
		<div class="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
			<h2 class="text-sm font-medium text-[var(--color-muted)]">Thoughts</h2>
			<p class="mt-2 whitespace-pre-wrap text-sm">{data.book.thoughts}</p>
		</div>
	{/if}
{:else}
	<p class="text-[var(--color-muted)]">Book not found.</p>
	<a href="/reading" class="mt-2 inline-block text-sm text-[var(--color-primary)] hover:underline">← Back to Reading</a>
{/if}
