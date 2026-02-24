export type TodoCadence = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type EmailReminderWhen =
	| 'at_time'   // specific time (e.g. 9:00)
	| 'before'    // X minutes/hours before due
	| 'day_before';

export interface EmailReminder {
	enabled: boolean;
	when: EmailReminderWhen;
	/** For at_time: "09:00". For before: minutes before. For day_before: ignored. */
	value?: string | number;
}

export interface Todo {
	id: string;
	title: string;
	cadence: TodoCadence;
	/** If true, task repeats every period (daily/weekly/monthly/yearly). */
	recurring: boolean;
	/** Optional due time for the period, e.g. "09:00" or "end of day". */
	dueAt?: string | null;
	emailReminder: EmailReminder;
	completed: boolean;
	/** When it was completed (ISO date string), for recurring. */
	completedAt?: string | null;
	/** For weekly: day of week 0–6; monthly: day of month 1–31; yearly: month-day. */
	recurrenceDetail?: string | null;
}
