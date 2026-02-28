import 'dotenv/config';
import type { Handle } from '@sveltejs/kit';
import { getSessionByToken } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

function validateEnv(): void {
	if (!process.env.APP_PASSWORD_HASH?.trim()) {
		throw new Error(
			'[Ground Work] APP_PASSWORD_HASH is not set.\n' +
				"Generate a hash: node -e \"const b=require('bcrypt');console.log(b.hashSync('yourpassword',10))\"\n" +
				'Then add APP_PASSWORD_HASH=<hash> to your .env file.'
		);
	}
}

validateEnv();

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
	const isApi = pathname.startsWith('/api/');

	if (isLoginPage && event.locals.session) {
		throw redirect(302, '/');
	}
	if (!isLoginPage && !event.locals.session) {
		if (isApi) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(302, '/login');
	}

	return resolve(event);
};
