<script lang="ts">
	import { goto } from '$app/navigation';
	import BookCover from '$lib/components/BookCover.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { Book } from '$lib/types/book';

	interface Props {
		data: { book: Book | null };
	}

	let { data }: Props = $props();

	// Local state for edit UI (schema: reading_logs.current_page, books.rating, books.thoughts, books.status)
	let currentPage = $state(0);
	let rating = $state<number | null>(null);
	let thoughts = $state('');
	let status = $state<Book['status']>('want');

	$effect(() => {
		if (data.book) {
			currentPage = data.book.currentPage ?? 0;
			rating = data.book.rating ?? null;
			thoughts = data.book.thoughts ?? '';
			status = data.book.status;
		}
	});

	const progressPct = $derived(
		data.book?.pageCount && data.book.pageCount > 0 && currentPage > 0
			? (currentPage / data.book.pageCount) * 100
			: 0
	);

	const maxPage = $derived(data.book?.pageCount ?? 0);

	async function deleteBook() {
		if (!data.book || !confirm('Delete this book? This cannot be undone.')) return;
		const res = await fetch(`/api/books/${data.book.id}`, { method: 'DELETE', credentials: 'include' });
		if (res.ok) await goto('/reading');
	}

	function todayDate(): string {
		return new Date().toISOString().slice(0, 10);
	}

	async function updateProgress() {
		if (!data.book || !data.book.pageCount) return;
		let page = Number(currentPage) || 0;
		if (page < 0) page = 0;
		if (page > data.book.pageCount) page = data.book.pageCount;
		currentPage = page;

		const body = {
			bookId: parseInt(data.book.id, 10),
			date: todayDate(),
			currentPage: page,
			note: null
		};

		const res = await fetch('/api/reading-logs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			// Best-effort; leave UI as-is on failure.
			return;
		}
	}

	async function saveThoughts() {
		if (!data.book) return;
		const res = await fetch(`/api/books/${data.book.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				thoughts: thoughts.trim() || null,
				rating
			})
		});
		if (!res.ok) return;
		data = {
			...data,
			book: data.book
				? {
						...data.book,
						thoughts: thoughts.trim() || null,
						rating
					}
				: data.book
		};
	}

	async function startReading() {
		if (!data.book) return;
		const startDate = data.book.startDate || todayDate();
		const res = await fetch(`/api/books/${data.book.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				status: 'reading',
				startDate,
				finishDate: null
			})
		});
		if (!res.ok) return;
		status = 'reading';
		data = {
			...data,
			book: data.book
				? {
						...data.book,
						status: 'reading',
						startDate,
						finishDate: null
					}
				: data.book
		};
	}

	async function finishBook() {
		if (!data.book) return;
		const finishDate = todayDate();
		const res = await fetch(`/api/books/${data.book.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				status: 'finished',
				finishDate,
				rating,
				thoughts: thoughts.trim() || null
			})
		});
		if (!res.ok) return;
		status = 'finished';
		data = {
			...data,
			book: data.book
				? {
						...data.book,
						status: 'finished',
						finishDate,
						rating,
						thoughts: thoughts.trim() || null
					}
				: data.book
		};
	}

	async function moveToDnf() {
		if (!data.book) return;
		const finishDate = todayDate();
		const res = await fetch(`/api/books/${data.book.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				status: 'dnf',
				finishDate
			})
		});
		if (!res.ok) return;
		status = 'dnf';
		data = {
			...data,
			book: data.book
				? {
						...data.book,
						status: 'dnf',
						finishDate
					}
				: data.book
		};
	}

	async function restartReading() {
		if (!data.book) return;
		const startDate = todayDate();
		const res = await fetch(`/api/books/${data.book.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				status: 'reading',
				startDate,
				finishDate: null
			})
		});
		if (!res.ok) return;
		status = 'reading';
		data = {
			...data,
			book: data.book
				? {
						...data.book,
						status: 'reading',
						startDate,
						finishDate: null
					}
				: data.book
		};
		currentPage = 0;
	}
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

			{#if status === 'reading' && data.book.pageCount}
				<div class="mt-4">
					<ProgressBar value={currentPage} max={data.book.pageCount} label="Progress" />
					<div class="mt-2 flex flex-wrap items-center gap-2">
						<label for="current-page" class="label mb-0">Current page</label>
						<input
							id="current-page"
							type="number"
							min="0"
							max={maxPage || undefined}
							bind:value={currentPage}
							class="input w-24"
						/>
						{#if maxPage > 0}
							<span class="text-sm text-[var(--color-muted)]">/ {maxPage}</span>
						{/if}
						<button type="button" class="btn-secondary" onclick={updateProgress}>Update progress</button>
					</div>
				</div>
			{/if}

			<div class="mt-4 flex flex-wrap items-center gap-2">
				<label for="book-rating" class="label mb-0">Rating</label>
				<select
					id="book-rating"
					class="input w-20"
					value={rating != null ? String(rating) : ''}
					onchange={(e) => {
						const v = (e.currentTarget as HTMLSelectElement).value;
						rating = v === '' ? null : parseInt(v, 10);
					}}
				>
					<option value="">—</option>
					{#each [1, 2, 3, 4, 5] as n}
						<option value={n}>{n}/5</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Status actions (schema: books.status) -->
	<div class="mt-4 flex flex-wrap gap-2">
		{#if status === 'want'}
			<button type="button" class="btn-primary" onclick={startReading}>Start reading</button>
		{/if}
		{#if status === 'reading'}
			<button type="button" class="btn-primary" onclick={finishBook}>Finish book</button>
			<button type="button" class="btn-secondary" onclick={moveToDnf}>Move to Did not finish</button>
		{/if}
		{#if status === 'finished' || status === 'dnf'}
			<button type="button" class="btn-secondary" onclick={restartReading}>Start reading again</button>
		{/if}
	</div>

	<!-- Thoughts (schema: books.thoughts) -->
	<div class="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
		<h2 class="text-sm font-medium text-[var(--color-muted)]">Thoughts / notes</h2>
		<textarea
			class="input mt-2 min-h-[6rem] w-full resize-y"
			placeholder="Personal thoughts about this book…"
			bind:value={thoughts}
		></textarea>
		<button type="button" class="btn-secondary mt-2" onclick={saveThoughts}>Save thoughts</button>
	</div>

	<div class="mt-6 pt-4 border-t border-[var(--color-border)]">
		<button
			type="button"
			class="text-sm text-[var(--color-danger)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/20 rounded"
			onclick={deleteBook}
		>
			Delete book
		</button>
	</div>
{:else}
	<p class="text-[var(--color-muted)]">Book not found.</p>
	<a href="/reading" class="mt-2 inline-block text-sm text-[var(--color-primary)] hover:underline">← Back to Reading</a>
{/if}
