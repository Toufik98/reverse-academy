import type { RequestHandler } from './$types';

/** Root route: detect Accept-Language → redirect to /en or /fr */
export const GET: RequestHandler = ({ request, cookies }) => {
	// Check stored preference first
	const stored = cookies.get('ra-locale');
	if (stored === 'en' || stored === 'fr') {
		return new Response(null, {
			status: 302,
			headers: { Location: `/${stored}` }
		});
	}

	// Parse Accept-Language header
	const acceptLang = request.headers.get('accept-language') || '';
	const prefersFrench = acceptLang
		.split(',')
		.some((part) => part.trim().startsWith('fr'));

	const locale = prefersFrench ? 'fr' : 'en';

	cookies.set('ra-locale', locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: false,
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: { Location: `/${locale}` }
	});
};
