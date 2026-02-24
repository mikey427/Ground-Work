import type { PageServerLoad } from './$types';
import type { Habit } from '$lib/types/habit';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs } from '$lib/server/db/schema.js';
import { isHabitCountedForDayCompletion } from '$lib/habit-frequency.js';
import { addDaysToDateStr, getMondayDateStr, getTodayInZone } from '$lib/server/date-tz.js';
import { inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const today = getTodayInZone(timezone);
	const mondayStr = getMondayDateStr(timezone);
	const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const dateStrings: string[] = [];
	for (let i = 0; i < 7; i++) {
		dateStrings.push(addDaysToDateStr(mondayStr, i));
	}

	const habitsList = db.query.habits.findMany({ orderBy: (h, { asc }) => [asc(h.id)] }).sync();
	const logs =
		dateStrings.length > 0
			? db
					.select({
						habitId: habitLogs.habitId,
						date: habitLogs.date,
						completed: habitLogs.completed,
						id: habitLogs.id
					})
					.from(habitLogs)
					.where(inArray(habitLogs.date, dateStrings))
					.all()
			: [];

	const logByKey: Record<string, { completed: boolean; logId: string }> = {};
	for (const row of logs) {
		logByKey[`${row.habitId}-${row.date}`] = { completed: row.completed, logId: String(row.id) };
	}

	// For each day index (0=Mon..6=Sun), which habit ids count toward "day complete"
	const dueHabitIdsByDayIndex: number[][] = [];
	for (let i = 0; i < 7; i++) {
		dueHabitIdsByDayIndex[i] = habitsList.filter((h) => isHabitCountedForDayCompletion(h.frequency, i)).map((h) => h.id);
	}

	const days = dateStrings.map((dateStr, i) => {
		const dueIds = dueHabitIdsByDayIndex[i] ?? [];
		let completedCount = 0;
		for (const hid of dueIds) {
			const entry = logByKey[`${hid}-${dateStr}`];
			if (entry?.completed) completedCount += 1;
		}
		const dueCount = dueIds.length;
		const completed = dueCount > 0 && completedCount === dueCount;
		return {
			date: dateStr,
			label: dayNames[i],
			completed,
			count: completedCount,
			dueCount
		};
	});

	const habitsForPage: Habit[] = habitsList.map((h) => ({
		id: String(h.id),
		name: h.name,
		category: h.category,
		color: h.color,
		icon: h.icon,
		frequency: h.frequency
	}));

	const weekStart = dateStrings[0] ?? '';
	const weekEnd = dateStrings[6] ?? '';

	return {
		days,
		habits: habitsForPage,
		dayDates: dateStrings,
		logByKey,
		weekStart,
		weekEnd,
		today
	};
};
