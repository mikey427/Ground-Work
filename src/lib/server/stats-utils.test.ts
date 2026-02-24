import { describe, it, expect } from 'vitest';
import {
	computeHabitStats,
	getYearlyReadingProgress,
	type HabitForStats,
	type LogRow
} from './stats-utils.js';

function windowDates(start: string, count: number): string[] {
	const out: string[] = [];
	const d = new Date(start + 'T12:00:00Z');
	for (let i = 0; i < count; i++) {
		const x = new Date(d);
		x.setDate(d.getDate() + i);
		out.push(x.toISOString().slice(0, 10));
	}
	return out;
}

function yearDates(start: string, end: string): string[] {
	const out: string[] = [];
	const startD = new Date(start + 'T12:00:00Z');
	const endD = new Date(end + 'T12:00:00Z');
	for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
		out.push(d.toISOString().slice(0, 10));
	}
	return out;
}

describe('computeHabitStats', () => {
	it('returns zeros and em dash when no habits', () => {
		const window = windowDates('2025-01-01', 30);
		const year = yearDates('2024-02-24', '2025-02-24');

		const result = computeHabitStats([], [], [], window, year);

		expect(result).toEqual({
			completionRate: 0,
			streakCurrent: 0,
			streakLongest: 0,
			mostConsistentHabit: '—'
		});
	});

	it('computes 100% completion when one habit has all window days completed', () => {
		const habits: HabitForStats[] = [{ id: 1, name: 'Run' }];
		const window = windowDates('2025-01-01', 30);
		const logsWindow: LogRow[] = window.map((date) => ({
			habitId: 1,
			date,
			completed: true
		}));
		const year = yearDates('2024-02-24', '2025-02-24');
		const logsYear = logsWindow;

		const result = computeHabitStats(habits, logsWindow, logsYear, window, year);

		expect(result.completionRate).toBe(100);
		expect(result.mostConsistentHabit).toBe('Run');
	});

	it('computes partial completion rate and most consistent habit', () => {
		const habits: HabitForStats[] = [
			{ id: 1, name: 'Run' },
			{ id: 2, name: 'Read' }
		];
		const window = windowDates('2025-01-01', 30);
		// Run: 15 days, Read: 30 days -> 45/60 = 75%
		const logsWindow: LogRow[] = [
			...window.slice(0, 15).map((date) => ({ habitId: 1, date, completed: true })),
			...window.map((date) => ({ habitId: 2, date, completed: true }))
		];
		const year = yearDates('2024-02-24', '2025-02-24');
		const logsYear = logsWindow;

		const result = computeHabitStats(habits, logsWindow, logsYear, window, year);

		expect(result.completionRate).toBe(75);
		expect(result.mostConsistentHabit).toBe('Read');
	});

	it('ORs multiple logs per habit per day (completed if any is true)', () => {
		const habits: HabitForStats[] = [{ id: 1, name: 'Run' }];
		const window = windowDates('2025-01-01', 30);
		const logsWindow: LogRow[] = [
			{ habitId: 1, date: window[0]!, completed: false },
			{ habitId: 1, date: window[0]!, completed: true }
		];
		const year = yearDates('2024-02-24', '2025-02-24');

		const result = computeHabitStats(habits, logsWindow, [], window, year);

		expect(result.completionRate).toBe(Math.round((1 / 30) * 100));
	});

	it('computes best current and longest streak across habits', () => {
		const habits: HabitForStats[] = [
			{ id: 1, name: 'Run' },
			{ id: 2, name: 'Read' }
		];
		const window = windowDates('2025-02-01', 30);
		const year = yearDates('2025-02-01', '2025-02-28');
		// Habit 1: last 3 days completed -> current 3, longest 3
		// Habit 2: days 1–5 and last 2 days -> current 2, longest 5
		const logsYear: LogRow[] = [
			...['2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04', '2025-02-05'].map((date) => ({
				habitId: 2,
				date,
				completed: true
			})),
			...['2025-02-26', '2025-02-27', '2025-02-28'].map((date) => ({
				habitId: 1,
				date,
				completed: true
			})),
			...['2025-02-27', '2025-02-28'].map((date) => ({
				habitId: 2,
				date,
				completed: true
			}))
		];

		const result = computeHabitStats(habits, [], logsYear, window, year);

		expect(result.streakCurrent).toBe(3);
		expect(result.streakLongest).toBe(5);
	});

	it('resets streak when a day is missing (longest streak is 2)', () => {
		const habits: HabitForStats[] = [{ id: 1, name: 'Run' }];
		const year = yearDates('2025-02-24', '2025-03-02');
		const logsYear: LogRow[] = [
			{ habitId: 1, date: '2025-02-24', completed: true },
			{ habitId: 1, date: '2025-02-25', completed: true },
			// 26 missing
			{ habitId: 1, date: '2025-02-27', completed: true },
			{ habitId: 1, date: '2025-02-28', completed: true }
		];
		const window = windowDates('2025-02-24', 30);

		const result = computeHabitStats(habits, [], logsYear, window, year);

		// Longest streak is 2 (e.g. 24–25 or 27–28). Current streak is 0 because range ends 03-02 with no log.
		expect(result.streakLongest).toBe(2);
		expect(result.streakCurrent).toBe(0);
	});
});

describe('getYearlyReadingProgress', () => {
	it('returns 0 progress when no books finished', () => {
		const result = getYearlyReadingProgress(0);
		expect(result).toEqual({ yearlyGoal: 12, yearlyProgress: 0 });
	});

	it('returns progress up to default goal of 12', () => {
		expect(getYearlyReadingProgress(5)).toEqual({ yearlyGoal: 12, yearlyProgress: 5 });
		expect(getYearlyReadingProgress(12)).toEqual({ yearlyGoal: 12, yearlyProgress: 12 });
	});

	it('caps progress at goal when finished exceeds goal', () => {
		const result = getYearlyReadingProgress(20);
		expect(result).toEqual({ yearlyGoal: 12, yearlyProgress: 12 });
	});

	it('accepts custom goal', () => {
		const result = getYearlyReadingProgress(8, 10);
		expect(result).toEqual({ yearlyGoal: 10, yearlyProgress: 8 });
	});
});
