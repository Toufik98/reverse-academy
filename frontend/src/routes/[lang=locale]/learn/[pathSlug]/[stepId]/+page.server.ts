import type { PageServerLoad } from './$types';
import { loadPath } from '$engine/content-loader';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const locale = params.lang as 'en' | 'fr';
	const path = await loadPath(params.pathSlug, locale);

	if (!path) {
		throw error(404, locale === 'fr' ? 'Parcours introuvable' : 'Path not found');
	}

	const step = path.steps.find((s) => s.id === params.stepId);
	if (!step) {
		throw error(404, locale === 'fr' ? 'Étape introuvable' : 'Step not found');
	}

	return { path, step, stepId: params.stepId, pathSlug: params.pathSlug };
};
