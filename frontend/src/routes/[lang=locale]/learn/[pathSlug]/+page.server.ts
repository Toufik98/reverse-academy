import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadPath } from '$engine/content-loader';

export const load: PageServerLoad = async ({ params }) => {
  const { lang, pathSlug } = params;

  const path = await loadPath(pathSlug, lang as 'en' | 'fr');

  if (!path) {
    throw error(404, {
      message: lang === 'fr' ? 'Parcours introuvable.' : 'Learning path not found.',
    });
  }

  return { path };
};
