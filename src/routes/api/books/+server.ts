import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { books } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

/** GET /api/books?status=reading|want|finished|dnf optional */
export const GET: RequestHandler = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	if (statusParam != null) {
		const list = db.select().from(books).where(eq(books.status, statusParam)).all();
		return json(list);
	}
	const list = db.select().from(books).all();
	return json(list);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const title = typeof body?.title === 'string' ? body.title.trim() : '';
	const author = typeof body?.author === 'string' ? body.author.trim() : '';
	if (!title || !author) return json({ error: 'title and author are required' }, 400);
	const coverUrl = typeof body?.coverUrl === 'string' ? body.coverUrl.trim() || null : null;
	const genre = typeof body?.genre === 'string' ? body.genre.trim() || null : null;
	const pageCount = typeof body?.pageCount === 'number' ? body.pageCount : body?.pageCount != null ? parseInt(String(body.pageCount), 10) : null;
	const status = typeof body?.status === 'string' ? body.status : 'want';
	const rating = typeof body?.rating === 'number' ? body.rating : body?.rating != null ? parseInt(String(body.rating), 10) : null;
	const thoughts = typeof body?.thoughts === 'string' ? body.thoughts.trim() || null : null;
	const startDate = typeof body?.startDate === 'string' ? body.startDate.trim() || null : null;
	const finishDate = typeof body?.finishDate === 'string' ? body.finishDate.trim() || null : null;
	const createdAt = new Date().toISOString();
	const rows = db
		.insert(books)
		.values({
			title,
			author,
			coverUrl,
			genre,
			pageCount: Number.isNaN(pageCount as number) ? null : pageCount,
			status,
			rating: rating != null && !Number.isNaN(rating) ? rating : null,
			thoughts,
			startDate,
			finishDate,
			createdAt
		})
		.returning()
		.all();
	const row = rows[0];
	if (!row) return json({ error: 'Insert failed' }, 500);
	return json(row, 201);
};
