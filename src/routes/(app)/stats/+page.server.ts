import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs, books, readingLogs } from '$lib/server/db/schema.js';
import { addDaysToDateStr, getTodayInZone } from '$lib/server/date-tz.js';
import { computeHabitStats, getYearlyReadingProgress } from '$lib/server/stats-utils.js';
import { and, eq, gte, lte, isNotNull, sql } from 'drizzle-orm';

/** Synthetic habit id for "Read today" in stats; completion derived from reading_logs. */
const READ_TODAY_STATS_ID = -1;

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
	const habitsForStats = [...habitsList.map((h) => ({ id: h.id, name: h.name })), { id: READ_TODAY_STATS_ID, name: 'Read today' }];

	const habitLogsWindow = db
		.select({
			habitId: habitLogs.habitId,
			date: habitLogs.date,
			completed: habitLogs.completed
		})
		.from(habitLogs)
		.where(and(gte(habitLogs.date, startWindowStr), lte(habitLogs.date, todayStr)))
		.all();
	const readingLogsWindow = db
		.select({ date: readingLogs.date })
		.from(readingLogs)
		.where(and(gte(readingLogs.date, startWindowStr), lte(readingLogs.date, todayStr)))
		.all();
	const readTodayWindow = [...new Set(readingLogsWindow.map((r) => r.date))].map((date) => ({
		habitId: READ_TODAY_STATS_ID,
		date,
		completed: true
	}));
	const logsWindow = [...habitLogsWindow, ...readTodayWindow];

	const habitLogsYear = db
		.select({
			habitId: habitLogs.habitId,
			date: habitLogs.date,
			completed: habitLogs.completed
		})
		.from(habitLogs)
		.where(and(gte(habitLogs.date, oneYearAgoStr), lte(habitLogs.date, todayStr)))
		.all();
	const readingLogsYear = db
		.select({ date: readingLogs.date })
		.from(readingLogs)
		.where(and(gte(readingLogs.date, oneYearAgoStr), lte(readingLogs.date, todayStr)))
		.all();
	const readTodayYear = [...new Set(readingLogsYear.map((r) => r.date))].map((date) => ({
		habitId: READ_TODAY_STATS_ID,
		date,
		completed: true
	}));
	const logsYear = [...habitLogsYear, ...readTodayYear];

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

	// --- Reading stats ---
	const totalPagesRow = db
		.select({
			total: sql<number>`coalesce(sum(${books.pageCount}), 0)`
		})
		.from(books)
		.where(eq(books.status, 'finished'))
		.get();
	const totalPagesRead = totalPagesRow?.total ?? 0;

	const avgRatingRow = db
		.select({
			avgRating: sql<number | null>`avg(${books.rating})`
		})
		.from(books)
		.where(and(eq(books.status, 'finished'), isNotNull(books.rating)))
		.get();
	const averageRating: number | null = avgRatingRow?.avgRating ?? null;

	// Avg time to finish: average (max - min) days per finished book that has reading_logs
	const finishedBookIds = db
		.select({ id: books.id })
		.from(books)
		.where(eq(books.status, 'finished'))
		.all();
	const finishedIds = new Set(finishedBookIds.map((r) => r.id));

	const allLogsByBook = db
		.select({ bookId: readingLogs.bookId, date: readingLogs.date })
		.from(readingLogs)
		.all();

	const daysPerBook: number[] = [];
	const byBook = new Map<number, string[]>();
	for (const row of allLogsByBook) {
		if (!finishedIds.has(row.bookId)) continue;
		let dates = byBook.get(row.bookId);
		if (!dates) {
			dates = [];
			byBook.set(row.bookId, dates);
		}
		dates.push(row.date);
	}
	for (const dates of byBook.values()) {
		if (dates.length === 0) continue;
		const min = dates.reduce((a, b) => (a < b ? a : b));
		const max = dates.reduce((a, b) => (a > b ? a : b));
		const minMs = new Date(min).getTime();
		const maxMs = new Date(max).getTime();
		daysPerBook.push(Math.round((maxMs - minMs) / (24 * 60 * 60 * 1000)));
	}
	const avgDaysToFinish: number | null =
		daysPerBook.length > 0
			? Math.round(daysPerBook.reduce((a, b) => a + b, 0) / daysPerBook.length)
			: null;

	// Reading pace: total pages read / distinct dates with reading in last 30 days
	const distinctDatesLast30 = db
		.select({
			date: readingLogs.date
		})
		.from(readingLogs)
		.where(and(gte(readingLogs.date, startWindowStr), lte(readingLogs.date, todayStr)))
		.all();
	const uniqueDatesLast30 = new Set(distinctDatesLast30.map((r) => r.date)).size;
	const readingPacePagesPerDay: number | null =
		uniqueDatesLast30 > 0 ? Math.round((totalPagesRead / uniqueDatesLast30) * 10) / 10 : null;

	return {
		completionRate: habitStats.completionRate,
		streakCurrent: habitStats.streakCurrent,
		streakLongest: habitStats.streakLongest,
		mostConsistentHabit: habitStats.mostConsistentHabit,
		yearlyGoal,
		yearlyProgress,
		// Reading stats
		booksReadThisYear: finishedThisYear,
		totalPagesRead,
		averageRating,
		avgDaysToFinish,
		readingPacePagesPerDay
	};
};
