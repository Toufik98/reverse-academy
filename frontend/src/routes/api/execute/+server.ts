import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const API_URL = () => `${env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`;

export const POST: RequestHandler = async ({ request, cookies }) => {
	const sessionToken = cookies.get('ra-session');
	const body = await request.json();

	try {
		const response = await fetch(`${API_URL()}/execute`, {
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
		return json(
			{ success: false, error: 'Code execution service unavailable' },
			{ status: 503 }
		);
	}
};
