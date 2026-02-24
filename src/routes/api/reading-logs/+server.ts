import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { readingLogs } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

/** GET /api/reading-logs?bookId=1 or ?bookId=1&date=2025-01-15 or no query for all */
export const GET: RequestHandler = async ({ url }) => {
	const bookIdParam = url.searchParams.get('bookId');
	const dateParam = url.searchParams.get('date');
	if (bookIdParam != null) {
		const bookId = parseInt(bookIdParam, 10);
		if (Number.isNaN(bookId)) return json({ error: 'Invalid bookId' }, 400);
		if (dateParam != null) {
			const list = db
				.select()
				.from(readingLogs)
				.where(and(eq(readingLogs.bookId, bookId), eq(readingLogs.date, dateParam)))
				.all();
			return json(list);
		}
		const list = db.select().from(readingLogs).where(eq(readingLogs.bookId, bookId)).all();
		return json(list);
	}
	if (dateParam != null) {
		const list = db.select().from(readingLogs).where(eq(readingLogs.date, dateParam)).all();
		return json(list);
	}
	const list = db.select().from(readingLogs).all();
	return json(list);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const bookId = typeof body?.bookId === 'number' ? body.bookId : parseInt(String(body?.bookId ?? ''), 10);
	const date = typeof body?.date === 'string' ? body.date.trim() : '';
	const currentPage = typeof body?.currentPage === 'number' ? body.currentPage : parseInt(String(body?.currentPage ?? ''), 10);
	const note = typeof body?.note === 'string' ? body.note.trim() || null : null;
	if (Number.isNaN(bookId) || !date || Number.isNaN(currentPage)) {
		return json({ error: 'bookId, date and currentPage are required' }, 400);
	}
	const createdAt = new Date().toISOString();
	const rows = db
		.insert(readingLogs)
		.values({ bookId, date, currentPage, note, createdAt })
		.returning()
		.all();
	const row = rows[0];
	if (!row) return json({ error: 'Insert failed' }, 500);
	return json(row, 201);
};
