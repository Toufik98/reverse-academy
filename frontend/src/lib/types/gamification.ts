export interface Achievement {
	id: string;
	slug: string;
	title: string;
	description: string;
	icon: string;
	xpBonus: number;
	criteriaJson: string;
}

export interface UserAchievement {
	userId: string;
	achievementId: string;
	earnedAt: string;
	achievement: Achievement;
}

export interface XPEvent {
	type: 'step_complete' | 'path_complete' | 'achievement_earned';
	baseXP: number;
	multiplier: number;
	totalXP: number;
	reason?: string;
}

export interface LevelInfo {
	level: number;
	title: string;
	currentXP: number;
	xpForNextLevel: number;
	xpProgress: number; // 0-1 percentage
}

/** Level formula: level = floor(sqrt(xp / 100)) + 1 */
export function calculateLevel(xp: number): number {
	return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/** XP required for a given level: xp = (level - 1)^2 * 100 */
export function xpForLevel(level: number): number {
	return (level - 1) ** 2 * 100;
}

export function getLevelInfo(xp: number): LevelInfo {
	const level = calculateLevel(xp);
	const currentLevelXP = xpForLevel(level);
	const nextLevelXP = xpForLevel(level + 1);
	const xpIntoLevel = xp - currentLevelXP;
	const xpNeeded = nextLevelXP - currentLevelXP;

	return {
		level,
		title: getLevelTitle(level),
		currentXP: xp,
		xpForNextLevel: nextLevelXP,
		xpProgress: xpNeeded > 0 ? xpIntoLevel / xpNeeded : 1
	};
}

export function getLevelTitle(level: number): string {
	if (level >= 20) return 'Polymath';
	if (level >= 15) return 'Theory Master';
	if (level >= 10) return 'Reverse Engineer';
	if (level >= 5) return 'Concept Connector';
	if (level >= 3) return 'Bug Hunter';
	if (level >= 2) return 'Problem Spotter';
	return 'Curious Beginner';
}
