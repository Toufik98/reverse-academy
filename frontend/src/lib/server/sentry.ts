/**
 * Sentry error tracking — Frontend
 *
 * Captures unhandled errors, unhandled promise rejections,
 * and provides manual capture for critical flows.
 *
 * Environment:
 *   PUBLIC_SENTRY_DSN — Sentry DSN (optional, disabled if not set)
 */
import * as Sentry from '@sentry/svelte';

const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
		tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration()
		]
	});
}

export { Sentry };
