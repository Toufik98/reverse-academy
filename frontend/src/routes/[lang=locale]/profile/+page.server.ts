import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, cookies }) => {
	const locale = (params.lang as 'en' | 'fr') || 'en';

	// TODO: Fetch user data from API when auth is wired
	// For now, return mock data for layout purposes
	return {
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
};
