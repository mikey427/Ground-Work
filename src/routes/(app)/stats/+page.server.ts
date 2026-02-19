import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		completionRate: 72,
		streakCurrent: 5,
		streakLongest: 12,
		mostConsistentHabit: 'Morning stretch',
		yearlyGoal: 80,
		yearlyProgress: 42
	};
};
