import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs, books } from '$lib/server/db/schema.js';
import { addDaysToDateStr, getTodayInZone } from '$lib/server/date-tz.js';
import { computeHabitStats, getYearlyReadingProgress } from '$lib/server/stats-utils.js';
import { and, eq, gte, lte } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const todayStr = getTodayInZone(timezone);

	const windowDays = 30;
	const startWindowStr = addDaysToDateStr(todayStr, -(windowDays - 1));

	const windowDates: string[] = [];
	for (let i = 0; i < windowDays; i++) {
		windowDates.push(addDaysToDateStr(startWindowStr, i));
	}

	const oneYearAgoStr = addDaysToDateStr(todayStr, -365);

	const yearDates: string[] = [];
	for (let i = 0; i <= 365; i++) {
		const ds = addDaysToDateStr(oneYearAgoStr, i);
		yearDates.push(ds);
		if (ds === todayStr) break;
	}

	const habitsList = db.query.habits.findMany({ orderBy: (h, { asc }) => [asc(h.id)] }).sync();
	const habitsForStats = habitsList.map((h) => ({ id: h.id, name: h.name }));

	const logsWindow = db
		.select({
			habitId: habitLogs.habitId,
			date: habitLogs.date,
			completed: habitLogs.completed
		})
		.from(habitLogs)
		.where(and(gte(habitLogs.date, startWindowStr), lte(habitLogs.date, todayStr)))
		.all();

	const logsYear = db
		.select({
			habitId: habitLogs.habitId,
			date: habitLogs.date,
			completed: habitLogs.completed
		})
		.from(habitLogs)
		.where(and(gte(habitLogs.date, oneYearAgoStr), lte(habitLogs.date, todayStr)))
		.all();

	const habitStats = computeHabitStats(
		habitsForStats,
		logsWindow,
		logsYear,
		windowDates,
		yearDates
	);

	const currentYear = parseInt(todayStr.slice(0, 4), 10);
	const yearStart = `${currentYear}-01-01`;
	const yearEnd = `${currentYear}-12-31`;

	const finishedThisYear = db
		.select({ finishDate: books.finishDate })
		.from(books)
		.where(
			and(
				eq(books.status, 'finished'),
				gte(books.finishDate, yearStart),
				lte(books.finishDate, yearEnd)
			)
		)
		.all().length;

	const { yearlyGoal, yearlyProgress } = getYearlyReadingProgress(finishedThisYear);

	return {
		completionRate: habitStats.completionRate,
		streakCurrent: habitStats.streakCurrent,
		streakLongest: habitStats.streakLongest,
		mostConsistentHabit: habitStats.mostConsistentHabit,
		yearlyGoal,
		yearlyProgress
	};
};
