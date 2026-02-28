import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { books, readingLogs, habits, habitLogs, todos, settings } from '$lib/server/db/schema.js';

export const GET: RequestHandler = async () => {
	const data = {
		exportedAt: new Date().toISOString(),
		books: db.select().from(books).all(),
		readingLogs: db.select().from(readingLogs).all(),
		habits: db.select().from(habits).all(),
		habitLogs: db.select().from(habitLogs).all(),
		todos: db.select().from(todos).all(),
		settings: db.select().from(settings).all()
	};

	const filename = `ground-work-backup-${new Date().toISOString().slice(0, 10)}.json`;

	return new Response(JSON.stringify(data, null, 2), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
