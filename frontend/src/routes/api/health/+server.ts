import { json } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const API_BASE = BACKEND_URL ?? 'http://localhost:8080';
const API_URL = `${API_BASE}/api/v1`;

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const response = await fetch(`${API_URL}/health`);
		const data = await response.json();
		return json(data, { status: response.status });
	} catch {
		return json({ status: 'unhealthy', api: 'unreachable' }, { status: 503 });
	}
};
