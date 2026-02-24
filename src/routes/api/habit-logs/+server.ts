import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { habitLogs } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

/** GET /api/habit-logs?habitId=1&date=2025-01-15 or no query for all */
export const GET: RequestHandler = async ({ url }) => {
	const habitIdParam = url.searchParams.get('habitId');
	const dateParam = url.searchParams.get('date');
	if (habitIdParam != null && dateParam != null) {
		const habitId = parseInt(habitIdParam, 10);
		if (Number.isNaN(habitId)) return json({ error: 'Invalid habitId' }, 400);
		const list = db
			.select()
			.from(habitLogs)
			.where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, dateParam)))
			.all();
		return json(list);
	}
	if (dateParam != null) {
		const list = db.select().from(habitLogs).where(eq(habitLogs.date, dateParam)).all();
		return json(list);
	}
	if (habitIdParam != null) {
		const habitId = parseInt(habitIdParam, 10);
		if (Number.isNaN(habitId)) return json({ error: 'Invalid habitId' }, 400);
		const list = db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId)).all();
		return json(list);
	}
	const list = db.select().from(habitLogs).all();
	return json(list);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const habitId = typeof body?.habitId === 'number' ? body.habitId : parseInt(String(body?.habitId ?? ''), 10);
	const date = typeof body?.date === 'string' ? body.date.trim() : '';
	const completed = Boolean(body?.completed);
	const note = typeof body?.note === 'string' ? body.note.trim() || null : null;
	if (Number.isNaN(habitId) || !date) {
		return json({ error: 'habitId and date are required' }, 400);
	}
	const createdAt = new Date().toISOString();
	const rows = db
		.insert(habitLogs)
		.values({ habitId, date, completed, note, createdAt })
		.returning()
		.all();
	const row = rows[0];
	if (!row) return json({ error: 'Insert failed' }, 500);
	return json(row, 201);
};
