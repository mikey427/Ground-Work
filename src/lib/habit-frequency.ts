/**
 * Habit frequency helpers for weekly view and tracking.
 * Day index: 0 = Monday, 6 = Sunday (matches week page date order).
 */

/** Whether this habit is "due" on the given weekday (0=Mon .. 6=Sun). Used for grid (can log) and optional styling. */
export function isHabitDueOnWeekday(frequency: string, dayIndex: number): boolean {
	const f = (frequency ?? 'daily').toString().toLowerCase();
	if (f === 'daily') return true;
	if (f === 'weekdays') return dayIndex >= 0 && dayIndex <= 4; // Mon–Fri
	const n = parseInt(f, 10);
	if (n >= 1 && n <= 7) return true; // X per week: any day is valid to log
	return true; // fallback
}

/** Whether this habit counts toward "day complete" on the strip (daily and weekdays only on their days; X per week does not). */
export function isHabitCountedForDayCompletion(frequency: string, dayIndex: number): boolean {
	const f = (frequency ?? 'daily').toString().toLowerCase();
	if (f === 'daily') return true;
	if (f === 'weekdays') return dayIndex >= 0 && dayIndex <= 4;
	const n = parseInt(f, 10);
	if (n >= 1 && n <= 7) return false; // flexible target, no specific day required
	return true;
}

/** Weekly target number of completions, or null if not applicable. */
export function getWeeklyTarget(frequency: string): number | null {
	const f = (frequency ?? 'daily').toString().toLowerCase();
	if (f === 'daily') return 7;
	if (f === 'weekdays') return 5;
	const n = parseInt(f, 10);
	if (n >= 1 && n <= 7) return n;
	return null;
}

/** Human-readable label for frequency (for UI). */
export function frequencyLabel(frequency: string): string {
	const f = (frequency ?? 'daily').toString().toLowerCase();
	if (f === 'daily') return 'Every day';
	if (f === 'weekdays') return 'Weekdays';
	const n = parseInt(f, 10);
	if (n >= 1 && n <= 7) return `${n}× per week`;
	return 'Daily';
}
