<script lang="ts">
	/** Fields match books table in schema: title, author, cover_url, genre, page_count, status */
	interface Props {
		error?: string | null;
	}

	let { error = null }: Props = $props();

	const statuses = [
		{ value: 'want', label: 'Want to read' },
		{ value: 'reading', label: 'Currently reading' }
	];
</script>

<div class="flex flex-col gap-4">
	<label for="book-title" class="label">Title</label>
	<input id="book-title" name="title" type="text" required placeholder="Book title" class="input" />

	<label for="book-author" class="label">Author</label>
	<input id="book-author" name="author" type="text" required placeholder="Author name" class="input" />

	<label for="book-cover-url" class="label">Cover URL (optional)</label>
	<input id="book-cover-url" name="coverUrl" type="url" placeholder="https://…" class="input" />

	<label for="book-genre" class="label">Genre / tags (optional)</label>
	<input id="book-genre" name="genre" type="text" placeholder="e.g. Fiction" class="input" />

	<label for="book-page-count" class="label">Page count (optional)</label>
	<input id="book-page-count" name="pageCount" type="number" min="1" placeholder="e.g. 300" class="input" />

	<label for="book-status" class="label">Status</label>
	<select id="book-status" name="status" class="input">
		{#each statuses as s}
			<option value={s.value}>{s.label}</option>
		{/each}
	</select>

	{#if error}
		<p class="text-sm text-red-600" role="alert">{error}</p>
	{/if}

	<div class="flex gap-2 pt-2">
		<button type="submit" class="btn-primary flex-1">Add book</button>
	</div>
</div>
