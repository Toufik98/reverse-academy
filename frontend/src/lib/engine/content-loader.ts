import type { LearningPath, DomainInfo } from '$types/path';
import type { Achievement } from '$types/gamification';
import type { SupportedLocale } from '$types/i18n';
import { env } from '$env/dynamic/private';

const API_BASE = () => env.BACKEND_URL || 'http://localhost:8080';

/**
 * Load a single learning path by slug from the API (source of truth).
 * Falls back to local JSON if the API is unreachable.
 */
export async function loadPath(slug: string, _locale?: SupportedLocale): Promise<LearningPath | null> {
	try {
		const res = await fetch(`${API_BASE()}/api/v1/paths/${slug}`);
		if (res.ok) {
			return (await res.json()) as LearningPath;
		}
		if (res.status === 404) return null;
	} catch {
		// API unavailable — fall through to local JSON
	}

	// Fallback: local JSON files
	const locale = _locale ?? 'en';
	try {
		const module = await import(`../../content/${locale}/paths/${slug}.json`);
		return module.default as LearningPath;
	} catch {
		if (locale !== 'en') {
			try {
				const fallback = await import(`../../content/en/paths/${slug}.json`);
				return fallback.default as LearningPath;
			} catch {
				return null;
			}
		}
		return null;
	}
}

/**
 * Load all learning paths from the API (source of truth).
 * Falls back to local JSON files via Vite glob imports.
 */
export async function loadAllPaths(_locale?: SupportedLocale): Promise<LearningPath[]> {
	try {
		const res = await fetch(`${API_BASE()}/api/v1/paths`);
		if (res.ok) {
			return (await res.json()) as LearningPath[];
		}
	} catch {
		// API unavailable — fall through to local JSON
	}

	// Fallback: local JSON files
	const locale = _locale ?? 'en';
	const paths: LearningPath[] = [];

	// Dynamically import all path JSON files for the requested locale
	const slugs = ['typescript-error-detective', 'python-debug-the-pipeline', 'rust-ownership-from-bugs', 'sql-query-detective', 'build-rest-api-backward'];
	for (const slug of slugs) {
		try {
			const module = await import(`../../content/${locale}/paths/${slug}.json`);
			paths.push(module.default as LearningPath);
		} catch {
			// skip missing files
		}
	}

	if (paths.length === 0 && locale !== 'en') {
		return loadAllPaths('en');
	}

	return paths;
}

/**
 * Load domain metadata for the explore page.
 */
export async function loadDomains(locale: SupportedLocale): Promise<DomainInfo[]> {
	try {
		const module = await import(`../../content/${locale}/domains.json`);
		return module.default as DomainInfo[];
	} catch {
		if (locale !== 'en') {
			const fallback = await import('../../content/en/domains.json');
			return fallback.default as DomainInfo[];
		}
		return [];
	}
}

/**
 * Load achievements definitions.
 */
export async function loadAchievements(locale: SupportedLocale): Promise<Achievement[]> {
	try {
		const module = await import(`../../content/${locale}/achievements.json`);
		return module.default as Achievement[];
	} catch {
		if (locale !== 'en') {
			const fallback = await import('../../content/en/achievements.json');
			return fallback.default as Achievement[];
		}
		return [];
	}
}
