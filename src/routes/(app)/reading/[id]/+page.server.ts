import type { PageServerLoad } from './$types';
import type { Book } from '$lib/types/book';

export const load: PageServerLoad = async ({ params }) => {
	// Placeholder: replace with real DB query by params.id
	const book: Book | null = {
		id: params.id,
		title: 'The Example Book',
		author: 'Jane Doe',
		coverUrl: null,
		genre: 'Fiction',
		pageCount: 300,
		status: 'reading',
		rating: null,
		thoughts: null,
		startDate: '2025-01-15',
		finishDate: null,
		currentPage: 120
	};
	return { book };
};
