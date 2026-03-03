import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const API_BASE = () => env.BACKEND_URL || 'http://localhost:8080';

export const load: PageServerLoad = async ({ parent }) => {
	const { adminToken } = await parent();

	try {
		const res = await fetch(`${API_BASE()}/api/v1/paths`);
		const paths = res.ok ? await res.json() : [];
		return { paths, adminToken };
	} catch {
		return { paths: [], adminToken };
	}
};
