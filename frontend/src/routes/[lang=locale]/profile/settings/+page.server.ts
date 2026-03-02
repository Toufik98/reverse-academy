import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, cookies }) => {
	const locale = params.lang || 'en';

	// TODO: Fetch user preferences from API
	return {
		preferences: {
			locale,
			theme: 'dark',
			editorFontSize: 14,
			editorTabSize: 2
		}
	};
};
