import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { todos } from '$lib/server/db/schema.js';
import { rowToTodo, emailReminderToJson } from '$lib/server/db/todo-utils.js';
import { json } from '$lib/server/api-utils.js';
import type { TodoCadence } from '$lib/types/todo';

const CADENCES: TodoCadence[] = ['daily', 'weekly', 'monthly', 'yearly'];

function validCadence(c: unknown): c is TodoCadence {
	return typeof c === 'string' && CADENCES.includes(c as TodoCadence);
}

export const GET: RequestHandler = async () => {
	const rows = db.query.todos.findMany({ orderBy: (t, { asc }) => [asc(t.id)] }).sync();
	return json(rows.map(rowToTodo));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const title = typeof body?.title === 'string' ? body.title.trim() : '';
	if (!title) return json({ error: 'title is required' }, 400);

	const cadence = validCadence(body?.cadence) ? body.cadence : 'daily';
	const recurring = Boolean(body?.recurring);
	const dueAt = typeof body?.dueAt === 'string' ? body.dueAt.trim() || null : null;
	const completed = Boolean(body?.completed);
	const completedAt =
		typeof body?.completedAt === 'string' ? body.completedAt.trim() || null : null;
	const recurrenceDetail =
		typeof body?.recurrenceDetail === 'string' ? body.recurrenceDetail.trim() || null : null;

	let emailReminderJson: string;
	if (
		body?.emailReminder &&
		typeof body.emailReminder === 'object' &&
		'enabled' in body.emailReminder &&
		'when' in body.emailReminder
	) {
		emailReminderJson = emailReminderToJson({
			enabled: Boolean(body.emailReminder.enabled),
			when: String(body.emailReminder.when) as 'at_time' | 'before' | 'day_before',
			value: body.emailReminder.value !== undefined ? body.emailReminder.value : undefined
		});
	} else {
		emailReminderJson = emailReminderToJson({ enabled: false, when: 'at_time' });
	}

	const createdAt = new Date().toISOString();
	const [row] = db
		.insert(todos)
		.values({
			title,
			cadence,
			recurring,
			dueAt,
			emailReminder: emailReminderJson,
			completed,
			completedAt,
			recurrenceDetail,
			createdAt
		})
		.returning()
		.all();

	if (!row) return json({ error: 'Insert failed' }, 500);
	return json(rowToTodo(row), 201);
};
