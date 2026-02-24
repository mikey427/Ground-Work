import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { habits } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '$lib/server/api-utils.js';

function parseId(id: string): number | null {
	const n = parseInt(id, 10);
	return Number.isNaN(n) ? null : n;
}

export const GET: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const row = db.select().from(habits).where(eq(habits.id, id)).get();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const body = await request.json().catch(() => ({}));
	const updates: Partial<{
		name: string;
		category: string;
		color: string;
		icon: string;
		frequency: string;
	}> = {};
	if (typeof body?.name === 'string') updates.name = body.name.trim();
	if (typeof body?.category === 'string') updates.category = body.category.trim();
	if (typeof body?.color === 'string') updates.color = body.color.trim();
	if (typeof body?.icon === 'string') updates.icon = body.icon;
	if (typeof body?.frequency === 'string') updates.frequency = body.frequency;
	if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400);
	const [row] = db.update(habits).set(updates).where(eq(habits.id, id)).returning().all();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const result = db.delete(habits).where(eq(habits.id, id)).run();
	if (result.changes === 0) return json({ error: 'Not found' }, 404);
	return new Response(null, { status: 204 });
};
