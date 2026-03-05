import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { books, readingLogs } from '$lib/server/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

/**
 * Toggle "Read today" habit: creates or deletes a reading_log for the given date.
 * Uses the most recent "Currently Reading" book (by id). When turning off, deletes
 * the reading_log for that book+date (logId required from client).
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const date = typeof body?.date === 'string' ? body.date.trim() : '';
	const completed = Boolean(body?.completed);
	const logIdParam = body?.logId;

	if (!date) {
		return json({ error: 'date is required' }, 400);
	}

	// Toggle OFF: delete existing reading_log by id
	if (!completed) {
		const logId = typeof logIdParam === 'number' ? logIdParam : parseInt(String(logIdParam ?? ''), 10);
		if (Number.isNaN(logId)) {
			return json({ error: 'logId is required when turning off' }, 400);
		}
		const existing = db.select().from(readingLogs).where(eq(readingLogs.id, logId)).get();
		if (!existing) {
			return json({ error: 'Reading log not found' }, 404);
		}
		db.delete(readingLogs).where(eq(readingLogs.id, logId)).run();
		return json({ ok: true, deleted: true });
	}

	// Toggle ON: find most recent "Currently Reading" book and create reading_log
	const readingBook = db
		.select()
		.from(books)
		.where(eq(books.status, 'reading'))
		.orderBy(desc(books.id))
		.limit(1)
		.get();

	if (!readingBook) {
		return json({ error: 'No book currently in "Currently Reading". Add one from Reading.' }, 400);
	}

	const latestLog = db
		.select()
		.from(readingLogs)
		.where(eq(readingLogs.bookId, readingBook.id))
		.orderBy(desc(readingLogs.date))
		.limit(1)
		.get();
	const currentPage = latestLog?.currentPage ?? 0;

	const createdAt = new Date().toISOString();
	const rows = db
		.insert(readingLogs)
		.values({
			bookId: readingBook.id,
			date,
			currentPage,
			note: null,
			createdAt
		})
		.returning()
		.all();
	const row = rows[0];
	if (!row) return json({ error: 'Insert failed' }, 500);
	return json({ ok: true, log: row }, 201);
};
