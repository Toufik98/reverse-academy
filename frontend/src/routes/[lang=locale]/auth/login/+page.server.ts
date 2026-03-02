import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const locale = params.lang || 'en';
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return {
				error: locale === 'fr' ? 'Email et mot de passe requis.' : 'Email and password are required.'
			};
		}

		try {
			// TODO: Call Rust API POST /api/v1/auth/login
			// const response = await fetch(`${API_URL}/auth/login`, { ... });
			// Set session cookie from response
			// cookies.set('ra-session', sessionToken, { ... });

			throw redirect(302, `/${locale}/explore`);
		} catch (err) {
			if (err instanceof Response || (err as any)?.status === 302) throw err;
			return {
				error: locale === 'fr' ? 'Identifiants incorrects.' : 'Invalid credentials.',
				email
			};
		}
	}
};
