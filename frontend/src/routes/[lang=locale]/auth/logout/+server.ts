import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const locale = params.lang || 'en';

	// TODO: Call Rust API to invalidate session
	// const sessionToken = cookies.get('ra-session');
	// await fetch(`${API_URL}/auth/logout`, { headers: { Authorization: `Bearer ${sessionToken}` } });

	cookies.delete('ra-session', { path: '/' });
	throw redirect(302, `${base}/${locale}`);
};
