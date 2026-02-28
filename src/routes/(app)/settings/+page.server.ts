import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/index.js';
import { settings } from '$lib/server/db/schema.js';

function getSettings() {
	return db.select().from(settings).limit(1).all()[0] ?? { yearlyGoal: 12 };
}

export const load: PageServerLoad = async ({ parent }) => {
	const { timezone } = await parent();
	const row = getSettings();
	return {
		yearlyGoal: row.yearlyGoal,
		timezone: timezone ?? null
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const raw = fd.get('yearlyGoal');
		const yearlyGoal = parseInt(raw as string, 10);

		if (isNaN(yearlyGoal) || yearlyGoal < 1 || yearlyGoal > 365) {
			return fail(400, { error: 'Yearly goal must be between 1 and 365.' });
		}

		const now = new Date().toISOString();
		db.insert(settings)
			.values({ id: 1, yearlyGoal, updatedAt: now })
			.onConflictDoUpdate({ target: settings.id, set: { yearlyGoal, updatedAt: now } })
			.run();

		return { success: true };
	}
};
