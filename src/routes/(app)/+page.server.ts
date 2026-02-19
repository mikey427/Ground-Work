import type { PageServerLoad } from './$types';
import type { Habit, HabitLog } from '$lib/types/habit';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().slice(0, 10);
	const habitsList = db.query.habits.findMany({ orderBy: (h, { asc }) => [asc(h.id)] }).sync();
	const logsList = db
		.select()
		.from(habitLogs)
		.where(eq(habitLogs.date, today))
		.all();

	const habitsForPage: Habit[] = habitsList.map((h) => ({
		id: String(h.id),
		name: h.name,
		category: h.category,
		color: h.color,
		icon: h.icon,
		frequency: h.frequency
	}));
	const logsForPage: HabitLog[] = logsList.map((l) => ({
		habitId: String(l.habitId),
		date: l.date,
		completed: l.completed,
		note: l.note ?? undefined
	}));
	const completedByHabitId = Object.fromEntries(
		logsForPage.filter((l) => l.completed).map((l) => [l.habitId, true])
	);
	const noteByHabitId = Object.fromEntries(
		logsForPage.filter((l) => l.note).map((l) => [l.habitId, l.note!])
	);

	return {
		habits: habitsForPage,
		completedByHabitId: completedByHabitId as Record<string, boolean>,
		noteByHabitId: noteByHabitId as Record<string, string>
	};
};
