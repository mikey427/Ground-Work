const WINDOW_DAYS = 84;

export interface MonthHeatmapCell {
	date: string;
	value: number;
	label?: string;
}

export interface MonthHeatmapResult {
	cells: MonthHeatmapCell[];
	rangeStart: string;
	rangeEnd: string;
}

/**
 * Build heatmap cells and range for the last WINDOW_DAYS (84) days including today.
 * Counts completed habit logs per day.
 */
export function buildMonthHeatmap(
	referenceDate: Date,
	logs: { date: string; completed: boolean }[]
): MonthHeatmapResult {
	const endDate = referenceDate.toISOString().slice(0, 10);
	const startDate = new Date(referenceDate);
	startDate.setDate(startDate.getDate() - WINDOW_DAYS);
	const startDateStr = startDate.toISOString().slice(0, 10);

	const completedCountByDate: Record<string, number> = {};
	for (const row of logs) {
		if (row.completed) {
			completedCountByDate[row.date] = (completedCountByDate[row.date] ?? 0) + 1;
		}
	}

	const cells: MonthHeatmapCell[] = [];
	for (let i = -WINDOW_DAYS; i <= 0; i++) {
		const d = new Date(referenceDate);
		d.setDate(d.getDate() + i);
		const dateStr = d.toISOString().slice(0, 10);
		cells.push({
			date: dateStr,
			value: completedCountByDate[dateStr] ?? 0,
			label: undefined
		});
	}

	const rangeStart = cells[0]?.date ?? startDateStr;
	const rangeEnd = cells[cells.length - 1]?.date ?? endDate;

	return { cells, rangeStart, rangeEnd };
}
