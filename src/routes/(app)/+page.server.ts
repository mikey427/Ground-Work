import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Habit, HabitLog } from '$lib/types/habit';
import { db } from '$lib/server/db/index.js';
import { habits, habitLogs } from '$lib/server/db/schema.js';
import { deleteSession } from '$lib/server/auth.js';
import { getTodayInZone } from '$lib/server/date-tz.js';
import { eq } from 'drizzle-orm';

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

	return {
		today,
		habits: habitsForPage,
		completedByHabitId: completedByHabitId as Record<string, boolean>,
		noteByHabitId: noteByHabitId as Record<string, string>,
		logIdByHabitId: logIdByHabitId as Record<string, string>
	};
};
