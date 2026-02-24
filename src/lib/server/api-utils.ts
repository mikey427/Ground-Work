/** Send JSON response with status. */
export function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

/** Parse JSON body or return 400 response. */
export async function parseBody<T>(request: Request): Promise<{ data: T } | { error: Response }> {
	try {
		const data = (await request.json()) as T;
		return { data };
	} catch {
		return { error: json({ error: 'Invalid JSON' }, 400) };
	}
}
