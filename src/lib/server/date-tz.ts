/**
 * Server-side date helpers that respect the user's timezone (from cookie).
 * Without a timezone we use UTC so server and first-load behavior stay consistent.
 */

import type { TodoCadence } from '$lib/types/todo.js';

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Today's date (YYYY-MM-DD) in the given IANA timezone, or UTC if no timezone. */
export function getTodayInZone(tz: string | undefined): string {
	if (!tz) return new Date().toISOString().slice(0, 10);
	return new Date().toLocaleDateString('en-CA', { timeZone: tz });
}

/** Monday (YYYY-MM-DD) of the week that contains "today" in the given timezone. */
export function getMondayDateStr(tz: string | undefined): string {
	const now = new Date();
	const todayStr = getTodayInZone(tz);

	if (!tz) {
		const day = now.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		return addDaysToDateStr(now.toISOString().slice(0, 10), diff);
	}

	const wd =
		new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' })
			.formatToParts(now)
			.find((p) => p.type === 'weekday')?.value ?? 'Mon';
	const dayNum = WEEKDAY[wd] ?? 1;
	const diff = dayNum === 0 ? -6 : 1 - dayNum;
	return addDaysToDateStr(todayStr, diff);
}

/** Add delta days to a YYYY-MM-DD string. */
export function addDaysToDateStr(dateStr: string, delta: number): string {
	const d = new Date(dateStr + 'T12:00:00');
	d.setDate(d.getDate() + delta);
	return d.toISOString().slice(0, 10);
}

/** Date (YYYY-MM-DD) of an ISO timestamp in the given IANA timezone, or UTC if no timezone. */
export function getDateStrInZone(isoDate: string, tz: string | undefined): string {
	if (!tz) return isoDate.slice(0, 10);
	const d = new Date(isoDate);
	return d.toLocaleDateString('en-CA', { timeZone: tz });
}

/**
 * True if completedAt falls within the current period for the given cadence (user TZ).
 * Used so recurring todos show as "due again" when a new day/week/month/year starts.
 */
export function isCompletedInCurrentPeriod(
	completedAt: string | null | undefined,
	cadence: TodoCadence,
	tz: string | undefined
): boolean {
	if (!completedAt) return false;
	const today = getTodayInZone(tz);
	const completedDate = getDateStrInZone(completedAt, tz);
	switch (cadence) {
		case 'daily':
			return completedDate === today;
		case 'weekly': {
			const monday = getMondayDateStr(tz);
			const sunday = addDaysToDateStr(monday, 6);
			return completedDate >= monday && completedDate <= sunday;
		}
		case 'monthly': {
			const [y, m] = today.split('-');
			const [cy, cm] = completedDate.split('-');
			return y === cy && m === cm;
		}
		case 'yearly': {
			const [y] = today.split('-');
			const [cy] = completedDate.split('-');
			return y === cy;
		}
		default:
			return false;
	}
}
