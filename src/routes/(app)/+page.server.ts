import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Habit, HabitLog } from '$lib/types/habit';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs, books, readingLogs, moodLogs } from '$lib/server/db/schema.js';
import { deleteSession } from '$lib/server/auth.js';
import { getTodayInZone } from '$lib/server/date-tz.js';
import { eq, and, desc } from 'drizzle-orm';

/** Virtual "Read today" habit id — not stored in DB; completion comes from reading_logs. */
const READ_TODAY_HABIT_ID = 'read-today';

const SESSION_COOKIE = 'session_token';

export const actions: Actions = {
	logout: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			deleteSession(token);
			cookies.delete(SESSION_COOKIE, { path: '/' });
		}
		throw redirect(303, '/login');
	},

	createHabit: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') ?? '').toString().trim();
		const category = (data.get('category') ?? '').toString().trim();
		const color = (data.get('color') ?? '#6b7280').toString().trim() || '#6b7280';
		const icon = (data.get('icon') ?? '').toString();
		const frequency = (data.get('frequency') ?? 'daily').toString() || 'daily';
		if (!name || !category) {
			return { createHabit: { error: 'Name and category are required' } };
		}
		const createdAt = new Date().toISOString();
		db.insert(habits).values({ name, category, color, icon, frequency, createdAt }).run();
		return { createHabit: { success: true } };
	},

	saveMood: async ({ request, cookies }) => {
		const data = await request.formData();
		const ratingRaw = (data.get('rating') ?? '').toString().trim();
		const noteRaw = (data.get('note') ?? '').toString().trim();

		const rating = parseInt(ratingRaw, 10);
		if (Number.isNaN(rating) || rating < 1 || rating > 5) {
			return {
				saveMood: {
					error: 'Please choose a mood between 1 and 5.'
				}
			};
		}

		const timezone = cookies.get('tz') ?? undefined;
		const today = getTodayInZone(timezone);
		const nowIso = new Date().toISOString();

		const existing = db
			.select()
			.from(moodLogs)
			.where(eq(moodLogs.date, today))
			.limit(1)
			.get();

		const note = noteRaw || null;

		if (existing) {
			db.update(moodLogs)
				.set({ rating, note })
				.where(eq(moodLogs.id, existing.id))
				.run();
		} else {
			db.insert(moodLogs)
				.values({
					date: today,
					rating,
					note,
					createdAt: nowIso
				})
				.run();
		}

		return {
			saveMood: {
				success: true
			}
		};
	}
};

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const today = getTodayInZone(timezone);
	const habitsList = db.query.habits.findMany({ orderBy: (h, { asc }) => [asc(h.id)] }).sync();
	const logsList = db
		.select()
		.from(habitLogs)
		.where(eq(habitLogs.date, today))
		.all();

	const habitsForPage: Habit[] = habitsList.map((h) => ({
		id: String(h.id),
		name: h.name,
		category: h.category,
		color: h.color,
		icon: h.icon,
		frequency: h.frequency
	}));
	const logsForPage: HabitLog[] = logsList.map((l) => ({
		habitId: String(l.habitId),
		date: l.date,
		completed: l.completed,
		note: l.note ?? undefined
	}));
	const completedByHabitId = Object.fromEntries(
		logsForPage.filter((l) => l.completed).map((l) => [l.habitId, true])
	);
	const noteByHabitId = Object.fromEntries(
		logsForPage.filter((l) => l.note).map((l) => [l.habitId, l.note!])
	);
	const logIdByHabitId = Object.fromEntries(
		logsList.map((l) => [String(l.habitId), String(l.id)])
	);

	// Virtual "Read today" habit: completion = reading_log for today for most recent "Currently Reading" book
	const readingBook = db
		.select()
		.from(books)
		.where(eq(books.status, 'reading'))
		.orderBy(desc(books.id))
		.limit(1)
		.get();
	let readTodayCompleted = false;
	let readTodayLogId: number | null = null;
	if (readingBook) {
		const todayLog = db
			.select()
			.from(readingLogs)
			.where(and(eq(readingLogs.bookId, readingBook.id), eq(readingLogs.date, today)))
			.limit(1)
			.get();
		if (todayLog) {
			readTodayCompleted = true;
			readTodayLogId = todayLog.id;
		}
	}
	const readTodayHabit: Habit = {
		id: READ_TODAY_HABIT_ID,
		name: 'Read today',
		category: 'Reading',
		color: '#6b7280',
		icon: '',
		frequency: 'daily'
	};
	habitsForPage.push(readTodayHabit);
	if (readTodayCompleted) completedByHabitId[READ_TODAY_HABIT_ID] = true;

	const moodRow = db
		.select()
		.from(moodLogs)
		.where(eq(moodLogs.date, today))
		.limit(1)
		.get();

	return {
		today,
		habits: habitsForPage,
		completedByHabitId: completedByHabitId as Record<string, boolean>,
		noteByHabitId: noteByHabitId as Record<string, string>,
		logIdByHabitId: logIdByHabitId as Record<string, string>,
		readTodayLogId,
		readTodayBookId: readingBook?.id ?? null,
		moodRating: moodRow?.rating ?? null,
		moodNote: moodRow?.note ?? null
	};
};
