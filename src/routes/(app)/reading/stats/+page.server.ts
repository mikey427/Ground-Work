import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { books, settings } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { getTodayInZone } from '$lib/server/date-tz.js';
import { computeReadingStats, getYearlyReadingProgress } from '$lib/server/stats-utils.js';

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const today = getTodayInZone(timezone);

	const finishedBooks = db
		.select({
			pageCount: books.pageCount,
			rating: books.rating,
			startDate: books.startDate,
			finishDate: books.finishDate
		})
		.from(books)
		.where(eq(books.status, 'finished'))
		.all();

	const settingsRow = db.select().from(settings).limit(1).all()[0];
	const goal = settingsRow?.yearlyGoal ?? 12;

	const currentYear = today.slice(0, 4);
	const finishedThisYear = finishedBooks.filter((b) => b.finishDate?.startsWith(currentYear)).length;
	const { yearlyGoal, yearlyProgress } = getYearlyReadingProgress(finishedThisYear, goal);

	const stats = computeReadingStats(finishedBooks, today);

	return { ...stats, yearlyGoal, yearlyProgress };
};
