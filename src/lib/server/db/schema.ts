import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/** Target frequency: daily, weekdays, or e.g. "3" for X times per week */
export const habits = sqliteTable('habits', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	category: text('category').notNull(),
	color: text('color').notNull(),
	icon: text('icon').notNull().default(''),
	frequency: text('frequency').notNull().default('daily'),
	createdAt: text('created_at').notNull()
});

export const habitLogs = sqliteTable('habit_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	habitId: integer('habit_id')
		.notNull()
		.references(() => habits.id, { onDelete: 'cascade' }),
	date: text('date').notNull(),
	completed: integer('completed', { mode: 'boolean' }).notNull(),
	note: text('note'),
	createdAt: text('created_at').notNull()
});

/** Book status: reading | want | finished | dnf */
export const books = sqliteTable('books', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	author: text('author').notNull(),
	coverUrl: text('cover_url'),
	genre: text('genre'),
	pageCount: integer('page_count'),
	status: text('status').notNull().default('want'),
	rating: integer('rating'),
	thoughts: text('thoughts'),
	startDate: text('start_date'),
	finishDate: text('finish_date'),
	createdAt: text('created_at').notNull()
});

export const readingLogs = sqliteTable('reading_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('book_id')
		.notNull()
		.references(() => books.id, { onDelete: 'cascade' }),
	date: text('date').notNull(),
	currentPage: integer('current_page').notNull(),
	note: text('note'),
	createdAt: text('created_at').notNull()
});

/** Session for single-password auth; token is stored in cookie. expiresAt = unix seconds */
export const sessions = sqliteTable('sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at').notNull(),
	createdAt: text('created_at').notNull()
});

/** Todo cadence: daily | weekly | monthly | yearly. emailReminder stored as JSON. */
export const todos = sqliteTable('todos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	cadence: text('cadence').notNull().default('daily'),
	recurring: integer('recurring', { mode: 'boolean' }).notNull().default(false),
	dueAt: text('due_at'),
	/** JSON: { enabled, when, value? } for EmailReminder */
	emailReminder: text('email_reminder').notNull().default('{"enabled":false,"when":"at_time"}'),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	completedAt: text('completed_at'),
	/** Weekly: day 0-6; monthly: day 1-31; yearly: e.g. "03-15" */
	recurrenceDetail: text('recurrence_detail'),
	createdAt: text('created_at').notNull()
});
