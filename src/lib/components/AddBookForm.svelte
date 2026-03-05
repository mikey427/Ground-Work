<script lang="ts">
	/** Fields match books table in schema: title, author, cover_url, genre, page_count, status */
	import { searchBookCovers, DEBOUNCE_MS } from '$lib/bookCoverSearch';
	import type { CoverResult } from '$lib/bookCoverSearch';

	interface Props {
		error?: string | null;
	}

	let { error = null }: Props = $props();

	const statuses = [
		{ value: 'want', label: 'Want to read' },
		{ value: 'reading', label: 'Currently reading' },
		{ value: 'finished', label: 'Previously read' }
	];

	let title = $state('');
	let author = $state('');
	let coverUrl = $state('');
	let status = $state<'want' | 'reading' | 'finished'>('want');
	let startDate = $state('');
	let finishDate = $state('');
	let covers = $state<CoverResult[]>([]);
	let loading = $state(false);
	let coverSearchError = $state(false);
	let searchRunId = 0;

	$effect(() => {
		const t = title.trim();
		if (!t) {
			covers = [];
			coverSearchError = false;
			return;
		}
		const runId = ++searchRunId;
		coverSearchError = false;
		const id = setTimeout(async () => {
			loading = true;
			try {
				const results = await searchBookCovers(title, author);
				if (runId === searchRunId) {
					covers = results;
					coverSearchError = false;
				}
			} catch {
				if (runId === searchRunId) {
					covers = [];
					coverSearchError = true;
				}
			} finally {
				if (runId === searchRunId) loading = false;
			}
		}, DEBOUNCE_MS);
		return () => clearTimeout(id);
	});

	function selectCover(url: string) {
		coverUrl = url;
	}
</script>

<div class="flex flex-col gap-4">
	<label for="book-title" class="label">Title</label>
	<input
		id="book-title"
		name="title"
		type="text"
		required
		placeholder="Book title"
		class="input"
		bind:value={title}
	/>

	<label for="book-author" class="label">Author</label>
	<input
		id="book-author"
		name="author"
		type="text"
		required
		placeholder="Author name"
		class="input"
		bind:value={author}
	/>

	<!-- Cover picker: debounced search, up to 5 thumbnails -->
	<div class="flex flex-col gap-2">
		<span class="label">Cover (optional)</span>
		{#if loading}
			<p class="text-sm text-[var(--color-muted)]">Searching covers…</p>
		{:else if coverSearchError}
			<p class="text-sm text-amber-600">Couldn’t load covers. Try again or paste a URL below.</p>
		{:else if covers.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each covers as cover (cover.url)}
					<button
						type="button"
						class="rounded border-2 transition focus:outline-none focus:ring-2 {coverUrl === cover.url
							? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
							: 'border-transparent hover:border-[var(--color-border)]'}"
						aria-pressed={coverUrl === cover.url}
						aria-label="Use this cover"
						onclick={() => selectCover(cover.url)}
					>
						<img
							src={cover.url}
							alt=""
							class="h-20 w-14 object-cover rounded sm:h-24 sm:w-16"
							loading="lazy"
						/>
					</button>
				{/each}
			</div>
		{/if}
		<label for="book-cover-url" class="text-sm text-[var(--color-muted)]"
			>Or paste cover URL (optional)</label
		>
		<input
			id="book-cover-url"
			name="coverUrl"
			type="url"
			placeholder="https://…"
			class="input"
			bind:value={coverUrl}
		/>
	</div>

	<label for="book-genre" class="label">Genre / tags (optional)</label>
	<input id="book-genre" name="genre" type="text" placeholder="e.g. Fiction" class="input" />

	<label for="book-page-count" class="label">Page count (optional)</label>
	<input id="book-page-count" name="pageCount" type="number" min="1" placeholder="e.g. 300" class="input" />

	<label for="book-status" class="label">Status</label>
	<select id="book-status" name="status" class="input" bind:value={status}>
		{#each statuses as s}
			<option value={s.value}>{s.label}</option>
		{/each}
	</select>

	{#if status === 'finished'}
		<label for="book-start-date" class="label">Start date</label>
		<input
			id="book-start-date"
			name="startDate"
			type="date"
			class="input"
			bind:value={startDate}
		/>
		<label for="book-finish-date" class="label">Finish date</label>
		<input
			id="book-finish-date"
			name="finishDate"
			type="date"
			class="input"
			bind:value={finishDate}
		/>
	{/if}

	{#if error}
		<p class="text-sm text-red-600" role="alert">{error}</p>
	{/if}

	<div class="flex gap-2 pt-2">
		<button type="submit" class="btn-primary flex-1">Add book</button>
	</div>
</div>
