import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { books } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

function parseId(id: string): number | null {
	const n = parseInt(id, 10);
	return Number.isNaN(n) ? null : n;
}

export const GET: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const row = db.select().from(books).where(eq(books.id, id)).get();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const body = await request.json().catch(() => ({}));
	const updates: Partial<{
		title: string;
		author: string;
		coverUrl: string | null;
		genre: string | null;
		pageCount: number | null;
		status: string;
		rating: number | null;
		thoughts: string | null;
		startDate: string | null;
		finishDate: string | null;
	}> = {};
	if (typeof body?.title === 'string') updates.title = body.title.trim();
	if (typeof body?.author === 'string') updates.author = body.author.trim();
	if (body?.coverUrl !== undefined) updates.coverUrl = typeof body.coverUrl === 'string' ? body.coverUrl.trim() || null : null;
	if (body?.genre !== undefined) updates.genre = typeof body.genre === 'string' ? body.genre.trim() || null : null;
	if (body?.pageCount !== undefined) updates.pageCount = typeof body.pageCount === 'number' ? body.pageCount : parseInt(String(body.pageCount), 10);
	if (typeof body?.status === 'string') updates.status = body.status;
	if (body?.rating !== undefined) updates.rating = typeof body.rating === 'number' ? body.rating : body.rating === null ? null : parseInt(String(body.rating), 10);
	if (body?.thoughts !== undefined) updates.thoughts = typeof body.thoughts === 'string' ? body.thoughts.trim() || null : null;
	if (body?.startDate !== undefined) updates.startDate = typeof body.startDate === 'string' ? body.startDate.trim() || null : null;
	if (body?.finishDate !== undefined) updates.finishDate = typeof body.finishDate === 'string' ? body.finishDate.trim() || null : null;
	if (updates.pageCount !== undefined && Number.isNaN(updates.pageCount)) updates.pageCount = null;
	if (updates.rating !== undefined && Number.isNaN(updates.rating as number)) updates.rating = null;
	if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400);
	const rows = db.update(books).set(updates).where(eq(books.id, id)).returning().all();
	const row = rows[0];
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const existing = db.select().from(books).where(eq(books.id, id)).get();
	if (!existing) return json({ error: 'Not found' }, 404);
	db.delete(books).where(eq(books.id, id)).run();
	return new Response(null, { status: 204 });
};
