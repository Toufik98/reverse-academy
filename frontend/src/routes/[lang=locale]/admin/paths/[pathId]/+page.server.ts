import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const API_BASE = () => env.BACKEND_URL || 'http://localhost:8080';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { adminToken } = await parent();
	const pathId = params.pathId;

	try {
		const res = await fetch(`${API_BASE()}/api/v1/paths/${pathId}`);
		if (!res.ok) {
			throw error(404, `Path "${pathId}" not found`);
		}
		const path = await res.json();
		return { path, adminToken };
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(500, 'Cannot load path');
	}
};
