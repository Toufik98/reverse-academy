import { writable, derived } from 'svelte/store';
import type { UserProgress, PathProgress, LastActiveStep } from '$types/progress';

export const userProgress = writable<UserProgress[]>([]);

/**
 * Get progress summary for a specific path.
 */
export function getPathProgress(pathId: string, progress: UserProgress[]): PathProgress {
	const pathSteps = progress.filter((p) => p.pathId === pathId);
	const completed = pathSteps.filter((p) => p.status === 'completed');
	const current = pathSteps.find((p) => p.status === 'in-progress' || p.status === 'available');

	return {
		pathId,
		totalSteps: pathSteps.length,
		completedSteps: completed.length,
		currentStepId: current?.stepId,
		startedAt: pathSteps.length > 0 ? pathSteps[0].completedAt : undefined,
		completedAt:
			completed.length === pathSteps.length && pathSteps.length > 0
				? completed[completed.length - 1].completedAt
				: undefined
	};
}

/**
 * Save progress to API.
 */
export async function saveStepProgress(
	userId: string,
	stepId: string,
	status: string,
	answerJson?: string
): Promise<void> {
	try {
		await fetch(`/api/progress`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, stepId, status, answerJson })
		});
	} catch (err) {
		console.error('Failed to save progress:', err);
	}
}

/**
 * Load all progress for a user.
 */
export async function loadUserProgress(userId: string): Promise<UserProgress[]> {
	try {
		const res = await fetch(`/api/progress?userId=${userId}`);
		if (!res.ok) return [];
		return res.json();
	} catch {
		return [];
	}
}
