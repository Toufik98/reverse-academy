export type TutorState =
	| 'IDLE'
	| 'PROBLEM_PRESENTED'
	| 'ATTEMPTING'
	| 'HINT_OFFERED'
	| 'HINT_REVEALED'
	| 'REVEAL_THEORY'
	| 'DEEPER_DIVE'
	| 'CONCEPT_UNLOCKED'
	| 'NEXT_STEP'
	| 'PATH_COMPLETE';

export type TutorAction =
	| 'OFFER_HINT'
	| 'REVEAL_PARTIAL_THEORY'
	| 'SUGGEST_DECOMPOSE'
	| 'FAST_TRACK'
	| 'OFFER_PREREQUISITE_PATH';

export interface LearnerContext {
	attempts: number;
	hintUsed: boolean;
	correctAnswer: boolean;
	timeOnStep: number; // milliseconds
	consecutiveFailures: number;
	stepType: string;
}

export interface TutorRule {
	condition: (ctx: LearnerContext) => boolean;
	action: TutorAction;
	priority: number;
}

export interface TutorMessage {
	id: string;
	action: TutorAction;
	text: string;
	timestamp: number;
}
