import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
  const { lang } = params;

  if (!locals.user) {
    throw redirect(302, `/${lang}/auth/login`);
  }

  try {
    const [achievementsRes, userAchievementsRes] = await Promise.all([
      fetch('/api/achievements'),
      fetch(`/api/achievements/${locals.user.id}`),
    ]);

    const achievements = achievementsRes.ok ? await achievementsRes.json() : [];
    const userAchievements = userAchievementsRes.ok ? await userAchievementsRes.json() : [];

    return { achievements, userAchievements };
  } catch {
    return { achievements: [], userAchievements: [] };
  }
};
