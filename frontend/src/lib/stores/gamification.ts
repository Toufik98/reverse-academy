import { writable, derived } from 'svelte/store';
import { getLevelInfo, type LevelInfo, type UserAchievement, type XPEvent } from '$types/gamification';

// Core XP state
export const totalXP = writable(0);
export const achievements = writable<UserAchievement[]>([]);
export const recentXPEvent = writable<XPEvent | null>(null);

// Derived level info
export const levelInfo = derived(totalXP, ($xp): LevelInfo => getLevelInfo($xp));

/**
 * Award XP and trigger animation.
 */
export function awardXP(event: XPEvent): void {
	totalXP.update((xp) => xp + event.totalXP);
	recentXPEvent.set(event);

	// Clear the event after animation duration
	setTimeout(() => recentXPEvent.set(null), 2000);
}

/**
 * Check and award achievements after step/path completion.
 */
export async function checkAchievements(userId: string): Promise<void> {
	try {
		const res = await fetch(`/api/achievements`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
		});
		if (res.ok) {
			const newAchievements = await res.json();
			if (newAchievements.length > 0) {
				achievements.update((existing) => [...existing, ...newAchievements]);
			}
		}
	} catch (err) {
		// Achievement check failure is non-critical
		console.warn('Achievement check failed:', err);
	}
}
