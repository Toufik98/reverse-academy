import { json } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const API_BASE = BACKEND_URL ?? 'http://localhost:8080';
const API_URL = `${API_BASE}/api/v1`;

export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionToken = cookies.get('ra-session');
	const { userId } = params;

	try {
		const response = await fetch(`${API_URL}/progress/${userId}`, {
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
