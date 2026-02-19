export type BookStatus = 'reading' | 'want' | 'finished' | 'dnf';

export interface Book {
	id: string;
	title: string;
	author: string;
	coverUrl: string | null;
	genre: string | null;
	pageCount: number | null;
	status: BookStatus;
	rating: number | null;
	thoughts: string | null;
	startDate: string | null;
	finishDate: string | null;
	currentPage?: number;
}
