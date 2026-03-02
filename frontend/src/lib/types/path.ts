export type StepType = 'challenge' | 'reveal' | 'sandbox' | 'theory';
export type PathMode = 'problem-first' | 'fix-broken' | 'goal-tree';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Domain = 'programming' | 'web-dev' | 'systems' | 'stem' | 'languages';

export interface ChallengeContent {
	type: 'challenge';
	scenario: string;
	code: string;
	language: string;
	expectedFix?: string;
	validationRegex?: string;
	errorMessage?: string;
	hint?: string;
	expectedConcepts?: string[];
}

export interface RevealContent {
	type: 'reveal';
	theory: string;
	keyInsight: string;
	formula?: string | null;
	interactiveDemo?: {
		type: string;
		initialCode: string;
		prompt: string;
	};
	expandableSections?: Array<{
		title: string;
		content: string;
	}>;
}

export interface SandboxContent {
	type: 'sandbox';
	initialCode: string;
	language: string;
	prompt: string;
}

export interface TheoryContent {
	type: 'theory';
	content: string;
	expandableSections?: Array<{
		title: string;
		content: string;
	}>;
}

export type StepContent = ChallengeContent | RevealContent | SandboxContent | TheoryContent;

export interface Step {
	id: string;
	order: number;
	title: string;
	type: StepType;
	content: StepContent;
	hint?: string;
	xpReward: number;
}

export interface LearningPath {
	id: string;
	slug: string;
	title: string;
	domain: Domain;
	mode: PathMode;
	difficulty: Difficulty;
	description: string;
	xpReward: number;
	estimatedMinutes: number;
	steps: Step[];
	/** Populated on list endpoints (API PathEntry) */
	stepCount?: number;
	/** Populated on list endpoints (API PathEntry) */
	firstStepId?: string;
}

export interface DomainInfo {
	id: Domain;
	name: string;
	description: string;
	icon: string;
	pathCount: number;
}
