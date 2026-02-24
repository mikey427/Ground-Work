import type { PageServerLoad } from './$types';
import type { Book } from '$lib/types/book';
import { db } from '$lib/server/db/index.js';
import { books, readingLogs } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';

function parseId(id: string): number | null {
	const n = parseInt(id, 10);
	return Number.isNaN(n) ? null : n;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return { book: null };
	const row = db.select().from(books).where(eq(books.id, id)).get();
	if (!row) return { book: null };
	const latestLog = db
		.select()
		.from(readingLogs)
		.where(eq(readingLogs.bookId, id))
		.orderBy(desc(readingLogs.date))
		.limit(1)
		.get();
	const book: Book = {
		id: String(row.id),
		title: row.title,
		author: row.author,
		coverUrl: row.coverUrl,
		genre: row.genre,
		pageCount: row.pageCount,
		status: row.status as Book['status'],
		rating: row.rating,
		thoughts: row.thoughts,
		startDate: row.startDate,
		finishDate: row.finishDate,
		currentPage: latestLog?.currentPage ?? undefined
	};
	return { book };
};
