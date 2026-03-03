import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const locale = params.lang || 'en';
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!username || !email || !password) {
			return {
				error: locale === 'fr' ? 'Tous les champs sont requis.' : 'All fields are required.',
				username, email
			};
		}

		if (password !== confirmPassword) {
			return {
				error: locale === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.',
				username, email
			};
		}

		if (password.length < 8) {
			return {
				error: locale === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.',
				username, email
			};
		}

		try {
			// TODO: Call Rust API POST /api/v1/auth/register
			// const response = await fetch(`${API_URL}/auth/register`, { ... });
			// Set session cookie from response
			// Redirect to onboarding

			throw redirect(302, `${base}/${locale}/onboarding`);
		} catch (err) {
			if (err instanceof Response || (err as any)?.status === 302) throw err;
			return {
				error: locale === 'fr' ? 'Erreur lors de l\'inscription.' : 'Registration failed.',
				username, email
			};
		}
	}
};
