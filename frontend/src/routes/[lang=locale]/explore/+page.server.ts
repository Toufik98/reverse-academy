import type { PageServerLoad } from './$types';
import { loadAllPaths } from '$engine/content-loader';

export const load: PageServerLoad = async ({ params }) => {
	const locale = params.lang as 'en' | 'fr';
	const paths = await loadAllPaths(locale);
	return { paths };
};
