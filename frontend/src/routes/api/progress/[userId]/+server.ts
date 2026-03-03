import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const API_URL = () => `${env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`;

export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionToken = cookies.get('ra-session');
	const { userId } = params;

	try {
		const response = await fetch(`${API_URL()}/progress/${userId}`, {
			headers: {
				...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
			}
		});

		const data = await response.json();
		return json(data, { status: response.status });
	} catch {
		return json({ error: 'Progress service unavailable' }, { status: 503 });
	}
};
