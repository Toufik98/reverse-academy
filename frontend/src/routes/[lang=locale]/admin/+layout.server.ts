import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: LayoutServerLoad = async ({ cookies, params, url }) => {
	const adminToken = cookies.get('ra-admin-token');
	const isLoginPage = url.pathname.endsWith('/admin/login');

	// If no admin token cookie and not on login page, redirect to admin login
	if (!adminToken && !isLoginPage) {
		throw redirect(302, `${base}/${params.lang}/admin/login`);
	}

	return {
		adminToken: adminToken || '',
		locale: params.lang
	};
};
