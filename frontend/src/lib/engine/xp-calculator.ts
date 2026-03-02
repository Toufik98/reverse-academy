import type { Step, LearningPath } from '$types/path';

interface XPCalculation {
	baseXP: number;
	multiplier: number;
	totalXP: number;
	bonuses: string[];
}

/**
 * Calculate XP earned for completing a step.
 */
export function calculateStepXP(
	step: Step,
	attempts: number,
	hintUsed: boolean
): XPCalculation {
	const baseXP = step.xpReward;
	let multiplier = 1;
	const bonuses: string[] = [];

	// First attempt success: 2x
	if (attempts === 1) {
		multiplier *= 2;
		bonuses.push('First attempt bonus (2x)');
	}

	// No hints: 1.5x
	if (!hintUsed) {
		multiplier *= 1.5;
		bonuses.push('No hints bonus (1.5x)');
	}

	const totalXP = Math.round(baseXP * multiplier);

	return { baseXP, multiplier, totalXP, bonuses };
}

/**
 * Calculate XP earned for completing an entire path.
 */
export function calculatePathXP(
	path: LearningPath,
	totalAttempts: number,
	hintsUsed: number,
	elapsedMinutes: number
): XPCalculation {
	const baseXP = path.xpReward;
	let multiplier = 1;
	const bonuses: string[] = [];

	// Average attempts across all steps
	const avgAttempts = totalAttempts / path.steps.length;
	if (avgAttempts <= 1.5) {
		multiplier *= 1.5;
		bonuses.push('Low attempts bonus (1.5x)');
	}

	// No hints used for entire path
	if (hintsUsed === 0) {
		multiplier *= 1.5;
		bonuses.push('No hints bonus (1.5x)');
	}

	// Under estimated time: 1.3x
	if (elapsedMinutes < path.estimatedMinutes) {
		multiplier *= 1.3;
		bonuses.push('Speed bonus (1.3x)');
	}

	const totalXP = Math.round(baseXP * multiplier);

	return { baseXP, multiplier, totalXP, bonuses };
}
