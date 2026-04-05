import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_BASE = () => env.BACKEND_URL ?? 'http://localhost:8080';

export const GET: RequestHandler = async ({ params, cookies, fetch: serverFetch }) => {
	const token = cookies.get('ra-session');
	const { userId } = params;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await serverFetch(`${API_BASE()}/api/v1/users/${userId}/preferences`, { headers });

	return new Response(res.body, {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

export const PATCH: RequestHandler = async ({ params, request, cookies, fetch: serverFetch }) => {
	const token = cookies.get('ra-session');
	const { userId } = params;
	const body = await request.text();

	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await serverFetch(`${API_BASE()}/api/v1/users/${userId}/preferences`, {
		method: 'PATCH',
		headers,
		body
	});

	return new Response(res.body, {
		status: res.status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
