import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, fetch }) => {
	const locale = (params.lang as 'en' | 'fr') || 'en';
	const userId = 'guest';

	try {
		const res = await fetch(`/api/users/${userId}`);
		if (res.ok) {
			const prefs = await res.json();
			return {
				userId,
				preferences: {
					locale: prefs.locale || locale,
					theme: prefs.theme || 'dark',
					editorFontSize: prefs.editor_font_size || 14,
					editorTabSize: prefs.editor_tab_size || 2
				}
			};
		}
	} catch {
		// Fall through to defaults
	}

	return {
		userId,
		preferences: {
			locale,
			theme: 'dark',
			editorFontSize: 14,
			editorTabSize: 2
		}
	};
};
