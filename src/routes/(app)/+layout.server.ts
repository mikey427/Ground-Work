import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad, Actions } from './$types';
import { deleteSession } from '$lib/server/auth.js';

const SESSION_COOKIE = 'session_token';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { user: (locals as { user?: unknown }).user ?? null };
};

export const actions: Actions = {
	logout: async ({ cookies, locals }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			deleteSession(token);
			cookies.delete(SESSION_COOKIE, { path: '/' });
		}
		throw redirect(303, '/login');
	}
};
