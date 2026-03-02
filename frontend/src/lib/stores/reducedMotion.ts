import { readable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Reactive store that tracks `prefers-reduced-motion: reduce` media query.
 * Svelte's JS-based transitions (fly, slide, fade) bypass CSS overrides,
 * so components must use this store to set `duration: 0` when active.
 *
 * Usage in components:
 *   import { reducedMotion } from '$stores/reducedMotion';
 *   transition:fly={{ duration: $reducedMotion ? 0 : 200 }}
 */
export const reducedMotion = readable(false, (set) => {
	if (!browser) return;

	const query = window.matchMedia('(prefers-reduced-motion: reduce)');
	set(query.matches);

	function onChange(e: MediaQueryListEvent) {
		set(e.matches);
	}

	query.addEventListener('change', onChange);
	return () => query.removeEventListener('change', onChange);
});

/** Helper: returns 0 if reduced motion is preferred, otherwise the given duration */
export function motionDuration(prefersReduced: boolean, duration: number): number {
	return prefersReduced ? 0 : duration;
}
