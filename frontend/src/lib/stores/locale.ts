import { writable } from 'svelte/store';
import type { SupportedLocale } from '$types/i18n';

export const locale = writable<SupportedLocale>('en');

/**
 * Set the active locale (called from layout on route change).
 */
export function setLocale(lang: SupportedLocale): void {
	locale.set(lang);
}
