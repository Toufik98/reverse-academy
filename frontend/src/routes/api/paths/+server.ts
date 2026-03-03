import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_BASE = () => env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * Proxy: GET /api/paths → Rust API GET /api/v1/paths
 * Returns all learning paths (without steps).
 */
export const GET: RequestHandler = async ({ fetch: serverFetch }) => {
	const res = await serverFetch(`${API_BASE()}/api/v1/paths`);

	return new Response(res.body, {
		status: res.status,
		headers: { 'Content-Type': 'application/json' }
	});
};
