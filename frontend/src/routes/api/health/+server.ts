import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const API_URL = () => `${env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`;

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const response = await fetch(`${API_URL()}/health`);
		const data = await response.json();
		return json(data, { status: response.status });
	} catch {
		return json({ status: 'unhealthy', api: 'unreachable' }, { status: 503 });
	}
};
