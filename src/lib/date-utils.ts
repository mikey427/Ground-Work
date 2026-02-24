/**
 * Human-readable date range (e.g. "2–24 Dec 2024" or "15 Dec 2024 – 24 Jan 2025").
 * Uses YYYY-MM-DD strings at noon to avoid timezone shifts.
 */
export function dateRangeLabel(start: string, end: string): string {
	const s = new Date(start + 'T12:00:00');
	const e = new Date(end + 'T12:00:00');
	const sameMonth = s.getMonth() === e.getMonth();
	const sameYear = s.getFullYear() === e.getFullYear();
	if (sameMonth && sameYear) {
		return `${s.getDate()}–${e.getDate()} ${s.toLocaleString('default', {
			month: 'short'
		})} ${s.getFullYear()}`;
	}
	if (sameYear) {
		return `${s.getDate()} ${s.toLocaleString('default', {
			month: 'short'
		})} – ${e.getDate()} ${e.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
	}
	return `${s.toLocaleDateString()} – ${e.toLocaleDateString()}`;
}
