import { describe, it, expect } from 'vitest';
import type { EmailReminder, Todo } from '$lib/types/todo';
import { rowToTodo, emailReminderToJson, type TodoRow } from './todo-utils.js';

function makeRow(overrides: Partial<TodoRow> = {}): TodoRow {
	return {
		id: 1,
		title: 'Test todo',
		cadence: 'daily',
		recurring: 0,
		dueAt: null,
		emailReminder: JSON.stringify({ enabled: true, when: 'at_time', value: '09:00' }),
		completed: 0,
		completedAt: null,
		recurrenceDetail: null,
		createdAt: '2025-01-01T00:00:00.000Z',
		...overrides
	};
}

describe('rowToTodo', () => {
	it('maps core fields and casts to correct types', () => {
		const row = makeRow({
			id: 42,
			recurring: 1,
			completed: 1,
			dueAt: '2025-01-02T10:00:00.000Z',
			completedAt: '2025-01-03T11:00:00.000Z',
			recurrenceDetail: '2'
		});

		const todo = rowToTodo(row);

		expect(todo).toEqual< Todo >({
			id: '42',
			title: 'Test todo',
			cadence: 'daily',
			recurring: true,
			dueAt: '2025-01-02T10:00:00.000Z',
			emailReminder: {
				enabled: true,
				when: 'at_time',
				value: '09:00'
			},
			completed: true,
			completedAt: '2025-01-03T11:00:00.000Z',
			recurrenceDetail: '2'
		});
	});

	it('normalises unknown cadence to daily', () => {
		const row = makeRow({ cadence: 'something-weird' });
		const todo = rowToTodo(row);
		expect(todo.cadence).toBe('daily');
	});

	it('parses missing or invalid emailReminder safely', () => {
		const missing = rowToTodo(makeRow({ emailReminder: '' }));
		expect(missing.emailReminder).toEqual< EmailReminder >({
			enabled: false,
			when: 'at_time'
		});

		const invalid = rowToTodo(makeRow({ emailReminder: 'not-json' }));
		expect(invalid.emailReminder).toEqual< EmailReminder >({
			enabled: false,
			when: 'at_time'
		});
	});
});

describe('emailReminderToJson', () => {
	it('serialises enabled reminder with value', () => {
		const reminder: EmailReminder = {
			enabled: true,
			when: 'before',
			value: 30
		};

		const json = emailReminderToJson(reminder);
		expect(JSON.parse(json)).toEqual({
			enabled: true,
			when: 'before',
			value: 30
		});
	});

	it('omits value when undefined', () => {
		const reminder: EmailReminder = {
			enabled: false,
			when: 'day_before'
		};

		const json = emailReminderToJson(reminder);
		expect(JSON.parse(json)).toEqual({
			enabled: false,
			when: 'day_before'
		});
	});
});

