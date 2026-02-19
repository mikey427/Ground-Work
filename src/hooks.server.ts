import 'dotenv/config';
import type { Handle } from '@sveltejs/kit';
import { getSessionByToken } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

const SESSION_COOKIE = 'session_token';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const session = getSessionByToken(token);
		if (session) {
			event.locals.session = { id: session.id, token: session.token };
		}
	}

	const pathname = event.url.pathname;
	const isLoginPage = pathname === '/login';

	if (isLoginPage && event.locals.session) {
		throw redirect(302, '/');
	}
	if (!isLoginPage && !event.locals.session) {
		throw redirect(302, '/login');
	}

	return resolve(event);
};
