import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { habitLogs } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

function parseId(id: string): number | null {
	const n = parseInt(id, 10);
	return Number.isNaN(n) ? null : n;
}

export const GET: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const row = db.select().from(habitLogs).where(eq(habitLogs.id, id)).get();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const body = await request.json().catch(() => ({}));
	const updates: Partial<{ completed: boolean; note: string | null }> = {};
	if (typeof body?.completed === 'boolean') updates.completed = body.completed;
	if (body?.note !== undefined) updates.note = typeof body.note === 'string' ? body.note.trim() || null : null;
	if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400);
	const rows = db.update(habitLogs).set(updates).where(eq(habitLogs.id, id)).returning().all();
	const row = rows[0];
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const existing = db.select().from(habitLogs).where(eq(habitLogs.id, id)).get();
	if (!existing) return json({ error: 'Not found' }, 404);
	db.delete(habitLogs).where(eq(habitLogs.id, id)).run();
	return new Response(null, { status: 204 });
};
