import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { todos } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { rowToTodo, emailReminderToJson } from '$lib/server/db/todo-utils.js';
import { json } from '$lib/server/api-utils.js';
import type { TodoCadence } from '$lib/types/todo';

const CADENCES: TodoCadence[] = ['daily', 'weekly', 'monthly', 'yearly'];

function parseId(id: string): number | null {
	const n = parseInt(id, 10);
	return Number.isNaN(n) ? null : n;
}

function validCadence(c: unknown): c is TodoCadence {
	return typeof c === 'string' && CADENCES.includes(c as TodoCadence);
}

export const GET: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const row = db.select().from(todos).where(eq(todos.id, id)).get();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(rowToTodo(row));
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const body = await request.json().catch(() => ({}));

	const updates: {
		title?: string;
		cadence?: string;
		recurring?: boolean;
		dueAt?: string | null;
		emailReminder?: string;
		completed?: boolean;
		completedAt?: string | null;
		recurrenceDetail?: string | null;
	} = {};

	if (typeof body?.title === 'string') updates.title = body.title.trim();
	if (validCadence(body?.cadence)) updates.cadence = body.cadence;
	if (typeof body?.recurring === 'boolean') updates.recurring = body.recurring;
	if (body?.dueAt !== undefined)
		updates.dueAt = typeof body.dueAt === 'string' ? body.dueAt.trim() || null : null;
	if (typeof body?.completed === 'boolean') updates.completed = body.completed;
	if (body?.completedAt !== undefined)
		updates.completedAt =
			typeof body.completedAt === 'string' ? body.completedAt.trim() || null : null;
	if (body?.recurrenceDetail !== undefined)
		updates.recurrenceDetail =
			typeof body.recurrenceDetail === 'string' ? body.recurrenceDetail.trim() || null : null;

	if (
		body?.emailReminder &&
		typeof body.emailReminder === 'object' &&
		'enabled' in body.emailReminder &&
		'when' in body.emailReminder
	) {
		updates.emailReminder = emailReminderToJson({
			enabled: Boolean(body.emailReminder.enabled),
			when: String(body.emailReminder.when) as 'at_time' | 'before' | 'day_before',
			value: body.emailReminder.value !== undefined ? body.emailReminder.value : undefined
		});
	}

	if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400);

	const [row] = db.update(todos).set(updates).where(eq(todos.id, id)).returning().all();
	if (!row) return json({ error: 'Not found' }, 404);
	return json(rowToTodo(row));
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id == null) return json({ error: 'Invalid id' }, 400);
	const result = db.delete(todos).where(eq(todos.id, id)).run();
	if (result.changes === 0) return json({ error: 'Not found' }, 404);
	return new Response(null, { status: 204 });
};
