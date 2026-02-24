import type { EmailReminder, Todo } from '$lib/types/todo';

const DEFAULT_EMAIL_REMINDER: EmailReminder = {
	enabled: false,
	when: 'at_time'
};

export type TodoRow = {
	id: number;
	title: string;
	cadence: string;
	recurring: number | boolean;
	dueAt: string | null;
	emailReminder: string;
	completed: number | boolean;
	completedAt: string | null;
	recurrenceDetail: string | null;
	createdAt: string;
};

function parseEmailReminder(raw: string | null | undefined): EmailReminder {
	if (!raw) return DEFAULT_EMAIL_REMINDER;
	try {
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		if (parsed && typeof parsed === 'object' && 'enabled' in parsed && 'when' in parsed) {
			return {
				enabled: Boolean(parsed.enabled),
				when: String(parsed.when) as EmailReminder['when'],
				value:
					'value' in parsed && parsed.value !== undefined
						? (parsed.value as string | number)
						: undefined
			};
		}
	} catch {
		// ignore
	}
	return DEFAULT_EMAIL_REMINDER;
}

const CADENCES = ['daily', 'weekly', 'monthly', 'yearly'] as const;

function normalizeCadence(c: string): Todo['cadence'] {
	return CADENCES.includes(c as Todo['cadence']) ? (c as Todo['cadence']) : 'daily';
}

/** Map DB row to frontend Todo (id as string, emailReminder as object). */
export function rowToTodo(row: TodoRow): Todo {
	return {
		id: String(row.id),
		title: row.title,
		cadence: normalizeCadence(row.cadence),
		recurring: Boolean(row.recurring),
		dueAt: row.dueAt ?? null,
		emailReminder: parseEmailReminder(row.emailReminder),
		completed: Boolean(row.completed),
		completedAt: row.completedAt ?? null,
		recurrenceDetail: row.recurrenceDetail ?? null
	};
}

export function emailReminderToJson(reminder: EmailReminder): string {
	return JSON.stringify({
		enabled: reminder.enabled,
		when: reminder.when,
		...(reminder.value !== undefined && { value: reminder.value })
	});
}
