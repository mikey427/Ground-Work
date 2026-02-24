import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { habits } from '$lib/server/db/schema.js';
import { json } from '$lib/server/api-utils.js';

export const GET: RequestHandler = async () => {
	const list = db.query.habits.findMany({ orderBy: (h, { asc }) => [asc(h.id)] }).sync();
	return json(list);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const name = typeof body?.name === 'string' ? body.name.trim() : '';
	const category = typeof body?.category === 'string' ? body.category.trim() : '';
	const color = typeof body?.color === 'string' ? body.color.trim() : '#6b7280';
	const icon = typeof body?.icon === 'string' ? body.icon : '';
	const frequency = typeof body?.frequency === 'string' ? body.frequency : 'daily';
	if (!name || !category) {
		return json({ error: 'name and category are required' }, 400);
	}
	const createdAt = new Date().toISOString();
	const rows = db
		.insert(habits)
		.values({ name, category, color, icon, frequency, createdAt })
		.returning()
		.all();
	const row = rows[0];
	if (!row) return json({ error: 'Insert failed' }, 500);
	return json(row, 201);
};
