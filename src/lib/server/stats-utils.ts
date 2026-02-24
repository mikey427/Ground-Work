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
