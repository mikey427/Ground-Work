import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { habitLogs, readingLogs } from '$lib/server/db/schema.js';
import { buildMonthHeatmap } from '$lib/server/month-utils.js';
import { addDaysToDateStr, getTodayInZone } from '$lib/server/date-tz.js';
import { and, gte, lte } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const todayStr = getTodayInZone(timezone);
	const endDate = todayStr;
	const startDateStr = addDaysToDateStr(todayStr, -84);

	const habitLogRows = db
		.select({ date: habitLogs.date, completed: habitLogs.completed })
		.from(habitLogs)
		.where(and(gte(habitLogs.date, startDateStr), lte(habitLogs.date, endDate)))
		.all();
	const readingLogRows = db
		.select({ date: readingLogs.date })
		.from(readingLogs)
		.where(and(gte(readingLogs.date, startDateStr), lte(readingLogs.date, endDate)))
		.all();
	const readTodayByDate = [...new Set(readingLogRows.map((r) => r.date))].map((date) => ({
		date,
		completed: true
	}));
	const logs = [...habitLogRows, ...readTodayByDate];

	return buildMonthHeatmap(new Date(todayStr + 'T12:00:00'), logs);
};
