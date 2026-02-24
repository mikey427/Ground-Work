import { describe, it, expect } from 'vitest';
import { buildMonthHeatmap } from './month-utils.js';

describe('buildMonthHeatmap', () => {
	it('returns 85 cells (84 days back + today)', () => {
		const ref = new Date('2025-02-24T12:00:00Z');
		const result = buildMonthHeatmap(ref, []);

		expect(result.cells).toHaveLength(85);
		expect(result.cells[0].date).toBe('2024-12-02');
		expect(result.cells[result.cells.length - 1].date).toBe('2025-02-24');
	});

	it('sets rangeStart and rangeEnd from first and last cell', () => {
		const ref = new Date('2025-01-15T12:00:00Z');
		const result = buildMonthHeatmap(ref, []);

		expect(result.rangeStart).toBe(result.cells[0].date);
		expect(result.rangeEnd).toBe(result.cells[result.cells.length - 1].date);
	});

	it('counts only completed logs per date', () => {
		const ref = new Date('2025-02-24T12:00:00Z');
		const logs = [
			{ date: '2025-02-24', completed: true },
			{ date: '2025-02-24', completed: true },
			{ date: '2025-02-24', completed: false },
			{ date: '2025-02-23', completed: true }
		];

		const result = buildMonthHeatmap(ref, logs);

		const todayCell = result.cells.find((c) => c.date === '2025-02-24');
		const yesterdayCell = result.cells.find((c) => c.date === '2025-02-23');
		expect(todayCell?.value).toBe(2);
		expect(yesterdayCell?.value).toBe(1);
	});

	it('assigns 0 to dates with no completed logs', () => {
		const ref = new Date('2025-02-24T12:00:00Z');
		const result = buildMonthHeatmap(ref, []);

		expect(result.cells.every((c) => c.value === 0)).toBe(true);
	});

	it('ignores logs outside the window', () => {
		const ref = new Date('2025-02-24T12:00:00Z');
		const logs = [
			{ date: '2024-12-01', completed: true },
			{ date: '2024-12-02', completed: true },
			{ date: '2025-02-24', completed: true }
		];

		const result = buildMonthHeatmap(ref, logs);

		const firstCell = result.cells[0];
		expect(firstCell.date).toBe('2024-12-02');
		expect(firstCell.value).toBe(1);
		const lastCell = result.cells[result.cells.length - 1];
		expect(lastCell.value).toBe(1);
	});
});
