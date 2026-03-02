import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, params, url }) => {
	const adminToken = cookies.get('ra-admin-token');
	const isLoginPage = url.pathname.endsWith('/admin/login');

	// If no admin token cookie and not on login page, redirect to admin login
	if (!adminToken && !isLoginPage) {
		throw redirect(302, `/${params.lang}/admin/login`);
	}

	return {
		adminToken: adminToken || '',
		locale: params.lang
	};
};
