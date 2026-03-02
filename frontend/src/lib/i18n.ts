import type { SupportedLocale } from '$types/i18n';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '$types/i18n';

/**
 * Detect the user's preferred locale from Accept-Language header or cookie.
 */
export function detectLocale(acceptLanguage?: string | null, cookie?: string | null): SupportedLocale {
	// Cookie takes precedence
	if (cookie && SUPPORTED_LOCALES.includes(cookie as SupportedLocale)) {
		return cookie as SupportedLocale;
	}

	// Parse Accept-Language header
	if (acceptLanguage) {
		const languages = acceptLanguage
			.split(',')
			.map((lang) => {
				const [code, q] = lang.trim().split(';q=');
				return { code: code.split('-')[0].toLowerCase(), quality: q ? parseFloat(q) : 1 };
			})
			.sort((a, b) => b.quality - a.quality);

		for (const lang of languages) {
			if (SUPPORTED_LOCALES.includes(lang.code as SupportedLocale)) {
				return lang.code as SupportedLocale;
			}
		}
	}

	return DEFAULT_LOCALE;
}

/**
 * Build a localized URL path.
 */
export function localizedPath(path: string, locale: SupportedLocale): string {
	// Strip existing locale prefix if present
	const stripped = path.replace(/^\/(en|fr)/, '');
	return `/${locale}${stripped || '/'}`;
}

/**
 * Get the alternate locale (for language switcher).
 */
export function getAlternateLocale(current: SupportedLocale): SupportedLocale {
	return current === 'en' ? 'fr' : 'en';
}
