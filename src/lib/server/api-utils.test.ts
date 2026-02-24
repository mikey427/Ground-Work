import { describe, it, expect } from 'vitest';
import { json, parseBody } from './api-utils.js';

describe('json', () => {
	it('returns a Response with JSON body and status', async () => {
		const data = { ok: true, value: 123 };

		const res = json(data, 201);

		expect(res.status).toBe(201);
		expect(res.headers.get('Content-Type')).toBe('application/json');
		const body = await res.text();
		expect(JSON.parse(body)).toEqual(data);
	});
});

describe('parseBody', () => {
	it('parses a valid JSON body', async () => {
		const payload = { name: 'test', count: 2 };
		const req = new Request('http://localhost', {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json' }
		});

		const result = await parseBody<typeof payload>(req);

		expect('data' in result && result.data).toEqual(payload);
	});

	it('returns error response on invalid JSON', async () => {
		const req = new Request('http://localhost', {
			method: 'POST',
			body: '{invalid json',
			headers: { 'Content-Type': 'application/json' }
		});

		const result = await parseBody<{ anything: string }>(req);

		expect('error' in result).toBe(true);
		if ('error' in result) {
			expect(result.error.status).toBe(400);
			const body = await result.error.text();
			expect(JSON.parse(body)).toEqual({ error: 'Invalid JSON' });
		}
	});
});

