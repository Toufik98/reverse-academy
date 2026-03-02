import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface UserSettings {
	locale: 'en' | 'fr';
	theme: 'dark' | 'light' | 'system';
	editorFontSize: number;
	editorTabSize: 2 | 4;
}

const defaultSettings: UserSettings = {
	locale: 'en',
	theme: 'dark',
	editorFontSize: 14,
	editorTabSize: 2
};

function loadSettings(): UserSettings {
	if (!browser) return defaultSettings;
	try {
		const stored = localStorage.getItem('ra:settings');
		if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
	} catch { /* ignore */ }
	return defaultSettings;
}

export const settings = writable<UserSettings>(loadSettings());

if (browser) {
	settings.subscribe((value) => {
		localStorage.setItem('ra:settings', JSON.stringify(value));
	});
}

/**
 * Save settings to server (authenticated users).
 */
export async function syncSettings(userId: string, s: UserSettings): Promise<void> {
	try {
		await fetch(`/api/v1/users/${userId}/preferences`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				locale: s.locale,
				editor_font_size: s.editorFontSize,
				editor_tab_size: s.editorTabSize
			})
		});
	} catch {
		// Settings sync failure is non-critical
	}
}
