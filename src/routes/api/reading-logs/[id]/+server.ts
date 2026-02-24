import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { readingLogs } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

function parseId(id: string): number | null {
	const n = parseInt(id, 10);
	return Number.isNaN(n) ? null : n;
}

export const GET: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const row = db.select().from(readingLogs).where(eq(readingLogs.id, id)).get();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const body = await request.json().catch(() => ({}));
	const updates: Partial<{ currentPage: number; note: string | null }> = {};
	if (typeof body?.currentPage === 'number') updates.currentPage = body.currentPage;
	if (body?.currentPage != null && typeof body.currentPage !== 'number') {
		const n = parseInt(String(body.currentPage), 10);
		if (!Number.isNaN(n)) updates.currentPage = n;
	}
	if (body?.note !== undefined) updates.note = typeof body.note === 'string' ? body.note.trim() || null : null;
	if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400);
	const rows = db.update(readingLogs).set(updates).where(eq(readingLogs.id, id)).returning().all();
	const row = rows[0];
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const existing = db.select().from(readingLogs).where(eq(readingLogs.id, id)).get();
	if (!existing) return json({ error: 'Not found' }, 404);
	db.delete(readingLogs).where(eq(readingLogs.id, id)).run();
	return new Response(null, { status: 204 });
};
