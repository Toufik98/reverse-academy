import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * Proxy POST /api/v1/execute to the Rust API backend.
 * This enables backend-tier code execution (Rust, Go, C++, Java via Piston).
 */
export const POST: RequestHandler = async ({ request, fetch: _fetch }) => {
	const backendUrl = env.BACKEND_URL || 'http://localhost:8080';

	try {
		const body = await request.json();

		const response = await fetch(`${backendUrl}/api/v1/execute`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const text = await response.text();
			return json(
				{ success: false, output: '', error: text || 'Backend execution failed' },
				{ status: response.status }
			);
		}

		const result = await response.json();
		return json(result);
	} catch (err: any) {
		return json(
			{
				success: false,
				output: '',
				error: `Code execution service unavailable. Ensure the Piston sidecar is running for compiled languages (Rust, Go, C++).`
			},
			{ status: 503 }
		);
	}
};
