import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	getDateStrInZone,
	getTodayInZone,
	getMondayDateStr,
	addDaysToDateStr,
	isCompletedInCurrentPeriod
} from './date-tz.js';

describe('getDateStrInZone', () => {
	it('returns date part in UTC when no timezone', () => {
		expect(getDateStrInZone('2025-02-24T15:00:00.000Z', undefined)).toBe('2025-02-24');
	});

	it('returns date in America/New_York for late UTC evening', () => {
		// 2025-02-25 02:00 UTC = 2025-02-24 21:00 EST
		expect(getDateStrInZone('2025-02-25T02:00:00.000Z', 'America/New_York')).toBe('2025-02-24');
	});
});

describe('isCompletedInCurrentPeriod', () => {
	const FEB_24_2025_MONDAY_UTC = new Date('2025-02-24T12:00:00.000Z');

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FEB_24_2025_MONDAY_UTC);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('daily', () => {
		it('returns true when completedAt is today (UTC)', () => {
			expect(
				isCompletedInCurrentPeriod('2025-02-24T09:00:00.000Z', 'daily', undefined)
			).toBe(true);
		});

		it('returns false when completedAt is yesterday', () => {
			expect(
				isCompletedInCurrentPeriod('2025-02-23T23:00:00.000Z', 'daily', undefined)
			).toBe(false);
		});

		it('returns false when completedAt is null', () => {
			expect(isCompletedInCurrentPeriod(null, 'daily', undefined)).toBe(false);
		});
	});

	describe('weekly', () => {
		it('returns true when completedAt is in same week (Mon 24 Feb 2025)', () => {
			// Same week: Mon 24 – Sun 2 Mar
			expect(
				isCompletedInCurrentPeriod('2025-02-24T08:00:00.000Z', 'weekly', undefined)
			).toBe(true);
			expect(
				isCompletedInCurrentPeriod('2025-03-02T08:00:00.000Z', 'weekly', undefined)
			).toBe(true);
		});

		it('returns false when completedAt is previous week', () => {
			expect(
				isCompletedInCurrentPeriod('2025-02-17T12:00:00.000Z', 'weekly', undefined)
			).toBe(false);
		});

		it('returns false when completedAt is next week', () => {
			expect(
				isCompletedInCurrentPeriod('2025-03-03T12:00:00.000Z', 'weekly', undefined)
			).toBe(false);
		});
	});

	describe('monthly', () => {
		it('returns true when completedAt is in same month', () => {
			expect(
				isCompletedInCurrentPeriod('2025-02-01T00:00:00.000Z', 'monthly', undefined)
			).toBe(true);
			expect(
				isCompletedInCurrentPeriod('2025-02-28T23:59:00.000Z', 'monthly', undefined)
			).toBe(true);
		});

		it('returns false when completedAt is previous month', () => {
			expect(
				isCompletedInCurrentPeriod('2025-01-15T12:00:00.000Z', 'monthly', undefined)
			).toBe(false);
		});

		it('returns false when completedAt is next month', () => {
			expect(
				isCompletedInCurrentPeriod('2025-03-01T00:00:00.000Z', 'monthly', undefined)
			).toBe(false);
		});
	});

	describe('yearly', () => {
		it('returns true when completedAt is in same year', () => {
			expect(
				isCompletedInCurrentPeriod('2025-01-01T00:00:00.000Z', 'yearly', undefined)
			).toBe(true);
			expect(
				isCompletedInCurrentPeriod('2025-12-31T23:59:00.000Z', 'yearly', undefined)
			).toBe(true);
		});

		it('returns false when completedAt is previous year', () => {
			expect(
				isCompletedInCurrentPeriod('2024-12-31T23:59:00.000Z', 'yearly', undefined)
			).toBe(false);
		});
	});
});

describe('getTodayInZone and getMondayDateStr (smoke with fake time)', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-02-24T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('today in UTC is 2025-02-24', () => {
		expect(getTodayInZone(undefined)).toBe('2025-02-24');
	});

	it('Monday of week containing 24 Feb 2025 is 24 Feb (same day)', () => {
		expect(getMondayDateStr(undefined)).toBe('2025-02-24');
	});

	it('addDaysToDateStr moves correctly', () => {
		expect(addDaysToDateStr('2025-02-24', 6)).toBe('2025-03-02');
	});
});
