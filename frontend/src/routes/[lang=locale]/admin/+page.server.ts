import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const API_BASE = () => env.BACKEND_URL || 'http://localhost:8080';

export const load: PageServerLoad = async ({ parent }) => {
	const { adminToken } = await parent();

	try {
		const [statsRes, pathsRes] = await Promise.all([
			fetch(`${API_BASE()}/api/v1/admin/stats`, {
				headers: { Authorization: `Bearer ${adminToken}` }
			}),
			fetch(`${API_BASE()}/api/v1/paths`)
		]);

		const stats = statsRes.ok ? await statsRes.json() : null;
		const paths = pathsRes.ok ? await pathsRes.json() : [];

		return { stats, paths };
	} catch {
		return { stats: null, paths: [] };
	}
};
