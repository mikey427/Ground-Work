/**
 * Client-side cover search. Calls the app's API proxy (Open Library + Google Books)
 * because those APIs block CORS from the browser.
 */
export const DEBOUNCE_MS = 300;

export interface CoverResult {
	url: string;
	title?: string;
	author?: string;
}

/**
 * Search for book covers via /api/covers/search (server proxy to Open Library, then Google Books).
 */
export async function searchBookCovers(
	title: string,
	author: string
): Promise<CoverResult[]> {
	const params = new URLSearchParams();
	if (title.trim()) params.set('title', title.trim());
	if (author.trim()) params.set('author', author.trim());
	if (params.toString() === '') return [];
	const res = await fetch(`/api/covers/search?${params.toString()}`);
	if (!res.ok) return [];
	const data = (await res.json()) as CoverResult[];
	return Array.isArray(data) ? data : [];
}
