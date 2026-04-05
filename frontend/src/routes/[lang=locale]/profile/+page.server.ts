import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, fetch }) => {
	const locale = (params.lang as 'en' | 'fr') || 'en';

	// Try to fetch user data from the API
	// When auth is fully wired, userId comes from the session
	// For now, we check if there's a userId cookie or return a guest state
	const userId = 'guest';

	try {
		const [progressRes, achievementsRes] = await Promise.all([
			fetch(`/api/progress/${userId}`),
			fetch(`/api/achievements/${userId}`)
		]);

		const progress = progressRes.ok ? await progressRes.json() : [];
		const achievements = achievementsRes.ok ? await achievementsRes.json() : [];

		const completedSteps = progress.filter((p: any) => p.status === 'completed').length;
		const paths = new Set(progress.filter((p: any) => p.status === 'completed').map((p: any) => p.path_id));

		return {
			userId,
			user: {
				username: 'Learner',
				email: '',
				level: 1,
				xp: 0,
				pathsCompleted: paths.size,
				stepsCompleted: completedSteps
			},
			achievements,
			earnedAchievementIds: achievements
		};
	} catch {
		return {
			userId,
			user: {
				username: 'Learner',
				email: '',
				level: 1,
				xp: 0,
				pathsCompleted: 0,
				stepsCompleted: 0
			},
			achievements: [],
			earnedAchievementIds: []
		};
	}
};
