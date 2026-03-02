import type { LayoutServerLoad } from './$types';
import type { SupportedLocale } from '$types/i18n';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	const locale = (params.lang as SupportedLocale) || 'en';

	// Persist locale choice
	cookies.set('ra-locale', locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: false,
		sameSite: 'lax'
	});

	return {
		locale,
		authenticated: false, // TODO: check Lucia session
		user: null
	};
};
