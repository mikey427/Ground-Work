export interface Habit {
	id: string;
	name: string;
	category: string;
	color: string;
	icon: string;
	frequency: string;
}

export interface HabitLog {
	habitId: string;
	date: string;
	completed: boolean;
	note?: string | null;
}
