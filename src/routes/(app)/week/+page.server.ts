import type { PageServerLoad } from './$types';
import type { Habit } from '$lib/types/habit';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs, books, readingLogs } from '$lib/server/db/schema.js';
import { isHabitCountedForDayCompletion } from '$lib/habit-frequency.js';
import { addDaysToDateStr, getMondayDateStr, getTodayInZone } from '$lib/server/date-tz.js';
import { inArray, eq, and, desc } from 'drizzle-orm';

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
	// Virtual "Read today" habit: completion from reading_logs for most recent "Currently Reading" book
	const readingBook = db
		.select()
		.from(books)
		.where(eq(books.status, 'reading'))
		.orderBy(desc(books.id))
		.limit(1)
		.get();
	for (const dateStr of dateStrings) {
		if (readingBook) {
			const rl = db
				.select()
				.from(readingLogs)
				.where(and(eq(readingLogs.bookId, readingBook.id), eq(readingLogs.date, dateStr)))
				.limit(1)
				.get();
			if (rl) {
				logByKey[`read-today-${dateStr}`] = { completed: true, logId: String(rl.id) };
			}
		}
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
		const readTodayDone = logByKey[`read-today-${dateStr}`]?.completed ?? false;
		if (readTodayDone) completedCount += 1;
		const dueCount = dueIds.length + 1; // +1 for virtual "Read today" (daily)
		const completed = dueCount > 0 && completedCount === dueCount;
		return {
			date: dateStr,
			label: dayNames[i],
			completed,
			count: completedCount,
			dueCount
		};
	});

	const habitsForPage: Habit[] = [
		...habitsList.map((h) => ({
			id: String(h.id),
			name: h.name,
			category: h.category,
			color: h.color,
			icon: h.icon,
			frequency: h.frequency
		})),
		{
			id: 'read-today',
			name: 'Read today',
			category: 'Reading',
			color: '#6b7280',
			icon: '',
			frequency: 'daily'
		}
	];

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
