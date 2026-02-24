import type { LayoutServerLoad } from './$types';

const TZ_COOKIE = 'tz';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const timezone = cookies.get(TZ_COOKIE) ?? undefined;
	return {
		user: (locals as { user?: unknown }).user ?? null,
		timezone
	};
};
