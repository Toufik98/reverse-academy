import { json } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const API_BASE = BACKEND_URL ?? 'http://localhost:8080';
const API_URL = `${API_BASE}/api/v1`;

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const sessionToken = cookies.get('ra-session');
	const { userId, stepId } = params;
	const body = await request.json();

	try {
		const response = await fetch(`${API_URL}/progress/${userId}/step/${stepId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();
		return json(data, { status: response.status });
	} catch {
		return json({ error: 'Progress service unavailable' }, { status: 503 });
	}
};

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
	const sessionToken = cookies.get('ra-session');
	const { userId, stepId } = params;
	const body = await request.json();

	try {
		const response = await fetch(`${API_URL}/progress/${userId}/step/${stepId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();
		return json(data, { status: response.status });
	} catch {
		return json({ error: 'Progress service unavailable' }, { status: 503 });
	}
};
