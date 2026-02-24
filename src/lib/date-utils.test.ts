import { describe, it, expect } from 'vitest';
import { dateRangeLabel } from './date-utils.js';

describe('dateRangeLabel', () => {
	it('formats same month and year as "d–d Mon YYYY"', () => {
		const result = dateRangeLabel('2025-02-02', '2025-02-24');
		expect(result).toMatch(/^2–24 \w+ 2025$/);
	});

	it('formats same year different months with month names', () => {
		const result = dateRangeLabel('2024-01-15', '2024-12-24');
		expect(result).toMatch(/^15 \w+ – 24 \w+ 2024$/);
	});

	it('includes both years when span crosses years', () => {
		const result = dateRangeLabel('2024-11-01', '2025-02-01');
		expect(result).toContain('–');
		expect(result).toContain('2024');
		expect(result).toContain('2025');
	});

	it('handles same start and end date', () => {
		const result = dateRangeLabel('2025-01-15', '2025-01-15');
		expect(result).toMatch(/^15–15 \w+ 2025$/);
	});
});
