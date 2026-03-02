import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light' | 'system';

function getInitialTheme(): Theme {
	if (!browser) return 'system';
	const stored = localStorage.getItem('ra:theme');
	if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	return 'system'; // Auto-detect by default
}

export const theme = writable<Theme>(getInitialTheme());

// Apply theme to document
if (browser) {
	theme.subscribe((value) => {
		localStorage.setItem('ra:theme', value);
		const resolved =
			value === 'system'
				? window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light'
				: value;
		document.documentElement.setAttribute('data-theme', resolved);
	});
}

export const resolvedTheme = derived(theme, ($theme) => {
	if (!browser) return 'dark';
	if ($theme === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return $theme;
});
