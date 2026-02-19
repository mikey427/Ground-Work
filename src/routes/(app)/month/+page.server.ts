import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const cells: { date: string; value: number; label?: string }[] = [];
	const today = new Date();
	for (let i = -84; i <= 0; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() + i);
		cells.push({
			date: d.toISOString().slice(0, 10),
			value: Math.floor(Math.random() * 3),
			label: undefined
		});
	}
	return { cells };
};
