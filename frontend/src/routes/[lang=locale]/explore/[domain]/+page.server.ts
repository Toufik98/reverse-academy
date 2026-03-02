import type { PageServerLoad } from './$types';
import { loadAllPaths } from '$engine/content-loader';
import type { SupportedLocale } from '$types/i18n';

export const load: PageServerLoad = async ({ params }) => {
  const { lang, domain } = params;
  const allPaths = await loadAllPaths(lang as SupportedLocale);

  const paths = allPaths.filter(
    (p) => p.domain.toLowerCase() === domain.toLowerCase()
  );

  return { paths, domain };
};
