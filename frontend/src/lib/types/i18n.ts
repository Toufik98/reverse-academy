export type SupportedLocale = 'en' | 'fr';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'fr'];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export interface LocaleContext {
	locale: SupportedLocale;
	t: (key: string) => string;
}
