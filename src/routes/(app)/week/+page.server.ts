import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const today = new Date();
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const days = [];
	for (let i = -6; i <= 0; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() + i);
		const dateStr = d.toISOString().slice(0, 10);
		days.push({
			date: dateStr,
			label: dayNames[d.getDay()],
			completed: Math.random() > 0.5,
			count: 0
		});
	}
	return { days };
};
