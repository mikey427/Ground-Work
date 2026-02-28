import type { PageServerLoad } from './$types';
import type { Todo } from '$lib/types/todo';
import { db } from '$lib/server/db/index.js';
import { todos as todosTable } from '$lib/server/db/schema.js';
import { rowToTodo } from '$lib/server/db/todo-utils.js';
import { isCompletedInCurrentPeriod } from '$lib/server/date-tz.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }): Promise<{ todos: Todo[] }> => {
	const { timezone } = await parent();
	const rows = db.query.todos.findMany({ orderBy: (t, { asc }) => [asc(t.id)] }).sync();
	const mapped = rows.map(rowToTodo);

	// Find recurring todos whose completion period has expired and reset them in the DB
	const expiredIds = mapped
		.filter(
			(t) =>
				t.recurring &&
				t.completed &&
				t.completedAt &&
				!isCompletedInCurrentPeriod(t.completedAt, t.cadence, timezone)
		)
		.map((t) => Number(t.id));

	for (const id of expiredIds) {
		db.update(todosTable)
			.set({ completed: false, completedAt: null })
			.where(eq(todosTable.id, id))
			.run();
	}

	const todos = mapped.map((t) =>
		expiredIds.includes(Number(t.id)) ? { ...t, completed: false, completedAt: null } : t
	);
	return { todos };
};
