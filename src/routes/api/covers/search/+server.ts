/**
 * Proxy for book cover search. Open Library and Google Books do not allow
 * CORS from the browser, so the client calls this endpoint instead.
 */
import type { RequestHandler } from './$types';

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_COVER_CDN = 'https://covers.openlibrary.org/b/id';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const MAX_RESULTS = 5;

export interface CoverResult {
	url: string;
	title?: string;
	author?: string;
}

async function searchOpenLibrary(title: string, author: string): Promise<CoverResult[]> {
	const params = new URLSearchParams();
	params.set('limit', String(MAX_RESULTS));
	if (title.trim()) params.set('title', title.trim());
	if (author.trim()) params.set('author', author.trim());
	const q = params.toString();
	if (!q.replace(/limit=\d+&?/, '').replace(/&$/, '').trim()) return [];
	const res = await fetch(`${OPEN_LIBRARY_SEARCH}?${q}`);
	if (!res.ok) return [];
	const data = (await res.json()) as { docs?: { cover_i?: number; title?: string; author_name?: string[] }[] };
	const docs = data.docs ?? [];
	const results: CoverResult[] = [];
	for (const doc of docs) {
		if (doc.cover_i != null && doc.cover_i > 0) {
			results.push({
				url: `${OPEN_LIBRARY_COVER_CDN}/${doc.cover_i}-M.jpg`,
				title: doc.title,
				author: doc.author_name?.[0]
			});
			if (results.length >= MAX_RESULTS) break;
		}
	}
	return results;
}

async function searchGoogleBooks(title: string, author: string): Promise<CoverResult[]> {
	const parts: string[] = [];
	if (title.trim()) parts.push(title.trim());
	if (author.trim()) parts.push(author.trim());
	const q = parts.join(' ');
	if (!q.trim()) return [];
	const params = new URLSearchParams({ q, maxResults: String(MAX_RESULTS) });
	const res = await fetch(`${GOOGLE_BOOKS_API}?${params.toString()}`);
	if (!res.ok) return [];
	const data = (await res.json()) as {
		items?: { volumeInfo?: { imageLinks?: { thumbnail?: string; small?: string; medium?: string }; title?: string; authors?: string[] } }[];
	};
	const items = data.items ?? [];
	const results: CoverResult[] = [];
	for (const item of items) {
		const info = item.volumeInfo;
		const link = info?.imageLinks?.thumbnail ?? info?.imageLinks?.small ?? info?.imageLinks?.medium;
		if (link) {
			let url = link;
			if (url.startsWith('http://')) url = url.replace('http://', 'https://');
			results.push({
				url,
				title: info?.title,
				author: info?.authors?.[0]
			});
			if (results.length >= MAX_RESULTS) break;
		}
	}
	return results;
}

export const GET: RequestHandler = async ({ url }) => {
	const title = (url.searchParams.get('title') ?? '').toString().trim();
	const author = (url.searchParams.get('author') ?? '').toString().trim();
	if (!title && !author) {
		return new Response(JSON.stringify([]), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
	try {
		const openLibrary = await searchOpenLibrary(title, author);
		if (openLibrary.length > 0) {
			return new Response(JSON.stringify(openLibrary), {
				headers: { 'Content-Type': 'application/json' }
			});
		}
		const googleBooks = await searchGoogleBooks(title, author);
		return new Response(JSON.stringify(googleBooks), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify([]), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
