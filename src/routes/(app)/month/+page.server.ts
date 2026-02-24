import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { habitLogs } from '$lib/server/db/schema.js';
import { buildMonthHeatmap } from '$lib/server/month-utils.js';
import { addDaysToDateStr, getTodayInZone } from '$lib/server/date-tz.js';
import { and, gte, lte } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const todayStr = getTodayInZone(timezone);
	const endDate = todayStr;
	const startDateStr = addDaysToDateStr(todayStr, -84);

	const logs = db
		.select({ date: habitLogs.date, completed: habitLogs.completed })
		.from(habitLogs)
		.where(and(gte(habitLogs.date, startDateStr), lte(habitLogs.date, endDate)))
		.all();

	return buildMonthHeatmap(new Date(todayStr + 'T12:00:00'), logs);
};
