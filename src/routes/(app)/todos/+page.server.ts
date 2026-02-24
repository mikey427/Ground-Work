import type { PageServerLoad } from './$types';
import type { Todo } from '$lib/types/todo';
import { db } from '$lib/server/db/index.js';
import { rowToTodo } from '$lib/server/db/todo-utils.js';
import { isCompletedInCurrentPeriod } from '$lib/server/date-tz.js';

export const load: PageServerLoad = async ({ parent }): Promise<{ todos: Todo[] }> => {
	const { timezone } = await parent();
	const rows = db.query.todos.findMany({ orderBy: (t, { asc }) => [asc(t.id)] }).sync();
	const todos = rows.map(rowToTodo).map((todo) => {
		if (!todo.recurring || !todo.completed || !todo.completedAt) return todo;
		const stillInPeriod = isCompletedInCurrentPeriod(todo.completedAt, todo.cadence, timezone);
		if (stillInPeriod) return todo;
		return { ...todo, completed: false };
	});
	return { todos };
};
