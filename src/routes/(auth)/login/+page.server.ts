import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { verifyPassword, createSession } from '$lib/server/auth.js';

const SESSION_COOKIE = 'session_token';
const SESSION_DAYS = 30;

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password');
		if (typeof password !== 'string' || !password.trim()) {
			return fail(400, { error: 'Password is required.' });
		}
		if (!verifyPassword(password)) {
			return fail(401, { error: 'Invalid password.' });
		}
		const { token } = createSession();
		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: SESSION_DAYS * 24 * 60 * 60
		});
		throw redirect(303, '/');
	}
};
