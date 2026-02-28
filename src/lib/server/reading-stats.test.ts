import { describe, it, expect } from 'vitest';
import { computeReadingStats, type BookForReadingStats } from './stats-utils.js';

describe('computeReadingStats', () => {
	it('returns zeros and nulls when no books', () => {
		const result = computeReadingStats([], '2025-01-01');
		expect(result).toEqual({
			totalFinished: 0,
			totalPages: 0,
			avgRating: null,
			avgDaysToFinish: null,
			readingPace: null,
			booksByYear: []
		});
	});

	it('counts total finished books', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: 4, startDate: '2025-01-01', finishDate: '2025-02-01' },
			{ pageCount: 200, rating: 5, startDate: '2025-02-05', finishDate: '2025-03-01' }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.totalFinished).toBe(2);
	});

	it('sums total pages, treating null pageCount as 0', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: null, finishDate: null },
			{ pageCount: null, rating: null, startDate: null, finishDate: null },
			{ pageCount: 200, rating: null, startDate: null, finishDate: null }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.totalPages).toBe(500);
	});

	it('computes average rating from rated books only', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: 4, startDate: null, finishDate: null },
			{ pageCount: 200, rating: null, startDate: null, finishDate: null },
			{ pageCount: 100, rating: 2, startDate: null, finishDate: null }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.avgRating).toBe(3.0); // (4 + 2) / 2
	});

	it('rounds avgRating to one decimal place', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 100, rating: 3, startDate: null, finishDate: null },
			{ pageCount: 100, rating: 4, startDate: null, finishDate: null },
			{ pageCount: 100, rating: 5, startDate: null, finishDate: null }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.avgRating).toBe(4.0); // (3+4+5)/3 = 4.0
	});

	it('returns null avgRating when no books have ratings', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: null, finishDate: null }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.avgRating).toBeNull();
	});

	it('computes avg days to finish for books with both dates', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: '2025-01-01', finishDate: '2025-01-11' }, // 10 days
			{ pageCount: 200, rating: null, startDate: '2025-02-01', finishDate: '2025-02-21' }, // 20 days
			{ pageCount: 100, rating: null, startDate: null, finishDate: null } // excluded
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.avgDaysToFinish).toBe(15); // (10 + 20) / 2
	});

	it('returns null avgDaysToFinish when no books have both start and finish dates', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: '2025-01-01', finishDate: null }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.avgDaysToFinish).toBeNull();
	});

	it('groups finished books by year of finishDate', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: '2024-01-01', finishDate: '2024-06-01' },
			{ pageCount: 200, rating: null, startDate: '2024-07-01', finishDate: '2024-12-01' },
			{ pageCount: 100, rating: null, startDate: '2025-01-01', finishDate: '2025-03-01' }
		];
		const result = computeReadingStats(booksData, '2025-06-01');
		expect(result.booksByYear).toEqual([
			{ year: 2024, count: 2 },
			{ year: 2025, count: 1 }
		]);
	});

	it('excludes books without finishDate from booksByYear', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: '2025-01-01', finishDate: '2025-06-01' },
			{ pageCount: 200, rating: null, startDate: '2025-01-01', finishDate: null }
		];
		const result = computeReadingStats(booksData, '2025-07-01');
		expect(result.booksByYear).toEqual([{ year: 2025, count: 1 }]);
	});

	it('computes reading pace as total pages / days since first start', () => {
		// 200 pages, started 2025-01-01, today 2025-02-01 = 31 days
		const booksData: BookForReadingStats[] = [
			{ pageCount: 200, rating: null, startDate: '2025-01-01', finishDate: '2025-02-01' }
		];
		const result = computeReadingStats(booksData, '2025-02-01');
		const expected = Math.round((200 / 31) * 10) / 10;
		expect(result.readingPace).toBe(expected);
	});

	it('uses earliest startDate for reading pace calculation', () => {
		// Two books; earliest start is 2025-01-01, today 2025-03-01 = 59 days, total 400 pages
		const booksData: BookForReadingStats[] = [
			{ pageCount: 200, rating: null, startDate: '2025-01-01', finishDate: '2025-01-31' },
			{ pageCount: 200, rating: null, startDate: '2025-02-01', finishDate: '2025-02-28' }
		];
		const result = computeReadingStats(booksData, '2025-03-01');
		const expected = Math.round((400 / 59) * 10) / 10;
		expect(result.readingPace).toBe(expected);
	});

	it('returns null readingPace when no pages recorded', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: null, rating: null, startDate: '2025-01-01', finishDate: '2025-02-01' }
		];
		const result = computeReadingStats(booksData, '2025-02-01');
		expect(result.readingPace).toBeNull();
	});

	it('returns null readingPace when no start dates', () => {
		const booksData: BookForReadingStats[] = [
			{ pageCount: 300, rating: null, startDate: null, finishDate: '2025-02-01' }
		];
		const result = computeReadingStats(booksData, '2025-02-01');
		expect(result.readingPace).toBeNull();
	});
});
