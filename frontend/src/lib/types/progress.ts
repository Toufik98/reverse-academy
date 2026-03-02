export type StepStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface UserProgress {
	id: string;
	userId: string;
	pathId: string;
	stepId: string;
	status: StepStatus;
	answerJson?: string;
	attempts: number;
	completedAt?: string;
	lastActiveAt?: string;
}

export interface PathProgress {
	pathId: string;
	totalSteps: number;
	completedSteps: number;
	currentStepId?: string;
	startedAt?: string;
	completedAt?: string;
}

export interface LastActiveStep {
	pathSlug: string;
	pathTitle: string;
	stepId: string;
	stepTitle: string;
	stepNumber: number;
	totalSteps: number;
}
