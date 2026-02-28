export interface HabitForStats {
	id: number;
	name: string;
}

export interface LogRow {
	habitId: number;
	date: string;
	completed: boolean;
}

export interface HabitStatsResult {
	completionRate: number;
	streakCurrent: number;
	streakLongest: number;
	mostConsistentHabit: string;
}

/**
 * Compute completion rate (last 30 days), best current/longest streak (over year range),
 * and most consistent habit. Uses windowDates and yearDates as the day sets.
 */
export function computeHabitStats(
	habits: HabitForStats[],
	logsWindow: LogRow[],
	logsYear: LogRow[],
	windowDates: string[],
	yearDates: string[]
): HabitStatsResult {
	let completionRate = 0;
	let streakCurrent = 0;
	let streakLongest = 0;
	const mostConsistentHabit = habits.length > 0 ? habits[0]!.name : '—';

	if (habits.length === 0) {
		return {
			completionRate: 0,
			streakCurrent: 0,
			streakLongest: 0,
			mostConsistentHabit: '—'
		};
	}

	const habitIds = habits.map((h) => h.id);

	const completedByKey: Record<string, boolean> = {};
	for (const row of logsWindow) {
		const key = `${row.habitId}-${row.date}`;
		completedByKey[key] = (completedByKey[key] ?? false) || row.completed;
	}

	const totalSlots = habits.length * windowDates.length;
	let completedSlots = 0;
	const completedDaysByHabit: Record<number, number> = {};
	for (const habitId of habitIds) {
		completedDaysByHabit[habitId] = 0;
		for (const dateStr of windowDates) {
			const key = `${habitId}-${dateStr}`;
			const done = completedByKey[key] ?? false;
			if (done) {
				completedSlots++;
				completedDaysByHabit[habitId]!++;
			}
		}
	}

	completionRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

	let bestRatio = -1;
	let bestHabitName = mostConsistentHabit;
	const windowDays = windowDates.length;
	for (const h of habits) {
		const completedDays = completedDaysByHabit[h.id] ?? 0;
		const ratio = windowDays > 0 ? completedDays / windowDays : 0;
		if (ratio > bestRatio) {
			bestRatio = ratio;
			bestHabitName = h.name;
		}
	}

	const completedYearByKey: Record<string, boolean> = {};
	for (const row of logsYear) {
		const key = `${row.habitId}-${row.date}`;
		completedYearByKey[key] = (completedYearByKey[key] ?? false) || row.completed;
	}

	let bestCurrent = 0;
	let bestLongest = 0;
	for (const habitId of habitIds) {
		let current = 0;
		let longest = 0;
		for (const dateStr of yearDates) {
			const key = `${habitId}-${dateStr}`;
			const done = completedYearByKey[key] ?? false;
			if (done) {
				current++;
				if (current > longest) longest = current;
			} else {
				current = 0;
			}
		}
		if (current > bestCurrent) bestCurrent = current;
		if (longest > bestLongest) bestLongest = longest;
	}

	return {
		completionRate,
		streakCurrent: bestCurrent,
		streakLongest: bestLongest,
		mostConsistentHabit: bestRatio >= 0 ? bestHabitName : '—'
	};
}

export interface BookForReadingStats {
	pageCount: number | null;
	rating: number | null;
	startDate: string | null;
	finishDate: string | null;
}

export interface BooksByYear {
	year: number;
	count: number;
}

export interface ReadingStatsResult {
	totalFinished: number;
	totalPages: number;
	avgRating: number | null;
	avgDaysToFinish: number | null;
	readingPace: number | null;
	booksByYear: BooksByYear[];
}

function dateDiffDays(from: string, to: string): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.round(
		(new Date(to + 'T12:00:00Z').getTime() - new Date(from + 'T12:00:00Z').getTime()) / msPerDay
	);
}

export function computeReadingStats(
	finishedBooks: BookForReadingStats[],
	today: string
): ReadingStatsResult {
	const totalFinished = finishedBooks.length;
	const totalPages = finishedBooks.reduce((sum, b) => sum + (b.pageCount ?? 0), 0);

	const ratedBooks = finishedBooks.filter((b) => b.rating != null);
	const avgRating =
		ratedBooks.length > 0
			? Math.round((ratedBooks.reduce((sum, b) => sum + b.rating!, 0) / ratedBooks.length) * 10) /
				10
			: null;

	const booksWithDates = finishedBooks.filter((b) => b.startDate != null && b.finishDate != null);
	const avgDaysToFinish =
		booksWithDates.length > 0
			? Math.round(
					booksWithDates.reduce((sum, b) => sum + dateDiffDays(b.startDate!, b.finishDate!), 0) /
						booksWithDates.length
				)
			: null;

	const allStartDates = finishedBooks.filter((b) => b.startDate != null).map((b) => b.startDate!);
	let readingPace: number | null = null;
	if (allStartDates.length > 0 && totalPages > 0) {
		const firstStart = [...allStartDates].sort()[0]!;
		const totalDays = dateDiffDays(firstStart, today);
		readingPace = totalDays > 0 ? Math.round((totalPages / totalDays) * 10) / 10 : null;
	}

	const yearCounts: Record<number, number> = {};
	for (const b of finishedBooks) {
		if (b.finishDate) {
			const year = parseInt(b.finishDate.slice(0, 4), 10);
			yearCounts[year] = (yearCounts[year] ?? 0) + 1;
		}
	}
	const booksByYear: BooksByYear[] = Object.entries(yearCounts)
		.map(([year, count]) => ({ year: parseInt(year, 10), count }))
		.sort((a, b) => a.year - b.year);

	return { totalFinished, totalPages, avgRating, avgDaysToFinish, readingPace, booksByYear };
}

const DEFAULT_YEARLY_GOAL = 12;

export function getYearlyReadingProgress(
	finishedThisYear: number,
	goal: number = DEFAULT_YEARLY_GOAL
): { yearlyGoal: number; yearlyProgress: number } {
	return {
		yearlyGoal: goal,
		yearlyProgress: Math.min(finishedThisYear, goal)
	};
}
