import type { PageServerLoad } from './$types';
import type { Book } from '$lib/types/book';

export const load: PageServerLoad = async () => {
	// Placeholder: replace with real DB query
	const books: Book[] = [
		{
			id: '1',
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
		},
		{
			id: '2',
			title: 'Another Title',
			author: 'John Smith',
			coverUrl: null,
			genre: null,
			pageCount: null,
			status: 'want',
			rating: null,
			thoughts: null,
			startDate: null,
			finishDate: null
		}
	];

	const byStatus = {
		reading: books.filter((b) => b.status === 'reading'),
		want: books.filter((b) => b.status === 'want'),
		finished: books.filter((b) => b.status === 'finished'),
		dnf: books.filter((b) => b.status === 'dnf')
	};

	return { books, byStatus };
};
