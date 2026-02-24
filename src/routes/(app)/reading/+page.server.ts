import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import type { Book } from '$lib/types/book';
import { db } from '$lib/server/db/index.js';
import { books, readingLogs } from '$lib/server/db/schema.js';
import { getTodayInZone } from '$lib/server/date-tz.js';
import { desc } from 'drizzle-orm';

function rowToBook(
	row: typeof books.$inferSelect,
	currentPage?: number | null
): Book {
	return {
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
		currentPage: currentPage ?? undefined
	};
}

export const load: PageServerLoad = async () => {
	const rows = db.select().from(books).all();
	// Latest reading log currentPage per book (for progress on list)
	const allLogs = db.select().from(readingLogs).orderBy(desc(readingLogs.date)).all();
	const currentPageByBookId: Record<number, number> = {};
	for (const log of allLogs) {
		if (currentPageByBookId[log.bookId] == null) currentPageByBookId[log.bookId] = log.currentPage;
	}

	const booksList: Book[] = rows.map((r) =>
		rowToBook(r, currentPageByBookId[r.id] ?? null)
	);

	const byStatus = {
		reading: booksList.filter((b) => b.status === 'reading'),
		want: booksList.filter((b) => b.status === 'want'),
		finished: booksList.filter((b) => b.status === 'finished'),
		dnf: booksList.filter((b) => b.status === 'dnf')
	};

	return { books: booksList, byStatus };
};

export const actions: Actions = {
	createBook: async ({ request, cookies }) => {
		const data = await request.formData();
		const title = (data.get('title') ?? '').toString().trim();
		const author = (data.get('author') ?? '').toString().trim();
		const coverUrlRaw = (data.get('coverUrl') ?? '').toString().trim();
		const genreRaw = (data.get('genre') ?? '').toString().trim();
		const pageCountRaw = (data.get('pageCount') ?? '').toString().trim();
		const statusRaw = (data.get('status') ?? 'want').toString().trim() || 'want';

		if (!title || !author) {
			return fail(400, {
				createBook: { error: 'Title and author are required.' }
			});
		}

		let pageCount: number | null = null;
		if (pageCountRaw) {
			const n = parseInt(pageCountRaw, 10);
			if (Number.isNaN(n) || n <= 0) {
				return fail(400, {
					createBook: { error: 'Page count must be a positive number.' }
				});
			}
			pageCount = n;
		}

		const allowedStatuses: Book['status'][] = ['reading', 'want', 'finished', 'dnf'];
		const status = allowedStatuses.includes(statusRaw as Book['status'])
			? (statusRaw as Book['status'])
			: 'want';

		const now = new Date();
		const timezone = cookies.get('tz') ?? undefined;
		const today = getTodayInZone(timezone);

		const coverUrl = coverUrlRaw || null;
		const genre = genreRaw || null;
		const startDate = status === 'reading' ? today : null;

		const createdAt = now.toISOString();

		db.insert(books)
			.values({
				title,
				author,
				coverUrl,
				genre,
				pageCount,
				status,
				startDate,
				createdAt
			})
			.run();

		return {
			createBook: { success: true }
		};
	}
};
