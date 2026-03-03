import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_BASE = () => env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * Proxy: GET /api/paths/:slug → Rust API GET /api/v1/paths/:slug
 * Returns a single learning path with all its steps.
 */
export const GET: RequestHandler = async ({ params, fetch: serverFetch }) => {
	const res = await serverFetch(`${API_BASE()}/api/v1/paths/${params.slug}`);

	return new Response(res.body, {
		status: res.status,
		headers: { 'Content-Type': 'application/json' }
	});
};
