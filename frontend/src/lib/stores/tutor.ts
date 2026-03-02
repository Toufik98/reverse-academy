import { writable, derived, get } from 'svelte/store';
import type { TutorState, TutorAction, TutorMessage, LearnerContext } from '$types/tutor';
import type { SupportedLocale } from '$types/i18n';
import { evaluateTutorRules } from '$engine/tutor-rules';
import { getTutorMessage } from '$engine/tutor-messages';
import { locale } from './locale';

// Tutor state machine
export const tutorState = writable<TutorState>('IDLE');
export const tutorMessages = writable<TutorMessage[]>([]);
export const tutorVisible = writable(false);

// Learner context tracking
export const learnerContext = writable<LearnerContext>({
	attempts: 0,
	hintUsed: false,
	correctAnswer: false,
	timeOnStep: 0,
	consecutiveFailures: 0,
	stepType: 'challenge'
});

let stepTimer: ReturnType<typeof setInterval> | null = null;
let stepStartTime = 0;

/**
 * Start tracking a new step.
 */
export function startStep(stepType: string): void {
	stepStartTime = Date.now();
	learnerContext.set({
		attempts: 0,
		hintUsed: false,
		correctAnswer: false,
		timeOnStep: 0,
		consecutiveFailures: 0,
		stepType
	});
	tutorState.set('PROBLEM_PRESENTED');
	tutorMessages.set([]);

	// Update time every second
	if (stepTimer) clearInterval(stepTimer);
	stepTimer = setInterval(() => {
		learnerContext.update((ctx) => ({
			...ctx,
			timeOnStep: Date.now() - stepStartTime
		}));
	}, 1000);
}

/**
 * Record an attempt and evaluate tutor rules.
 */
export function recordAttempt(correct: boolean): void {
	const currentLocale = get(locale);

	learnerContext.update((ctx) => ({
		...ctx,
		attempts: ctx.attempts + 1,
		correctAnswer: correct,
		consecutiveFailures: correct ? 0 : ctx.consecutiveFailures + 1
	}));

	if (correct) {
		tutorState.set('CONCEPT_UNLOCKED');
		if (stepTimer) clearInterval(stepTimer);
		return;
	}

	tutorState.set('ATTEMPTING');

	// Evaluate tutor rules
	const ctx = get(learnerContext);
	const action = evaluateTutorRules(ctx);

	if (action) {
		addTutorMessage(action, currentLocale);
		updateStateForAction(action);
	}
}

/**
 * Mark hint as used.
 */
export function useHint(): void {
	learnerContext.update((ctx) => ({ ...ctx, hintUsed: true }));
	tutorState.set('HINT_REVEALED');
}

/**
 * Move to next step or complete path.
 */
export function completeStep(isLastStep: boolean): void {
	if (stepTimer) clearInterval(stepTimer);
	tutorState.set(isLastStep ? 'PATH_COMPLETE' : 'NEXT_STEP');
}

/**
 * Reset tutor for a new session.
 */
export function resetTutor(): void {
	if (stepTimer) clearInterval(stepTimer);
	tutorState.set('IDLE');
	tutorMessages.set([]);
	tutorVisible.set(false);
}

// ─── Internal helpers ────────────────────────────────

function addTutorMessage(action: TutorAction, currentLocale: SupportedLocale): void {
	const text = getTutorMessage(action, currentLocale);
	const message: TutorMessage = {
		id: crypto.randomUUID(),
		action,
		text,
		timestamp: Date.now()
	};

	tutorMessages.update((msgs) => [...msgs, message]);
	tutorVisible.set(true);
}

function updateStateForAction(action: TutorAction): void {
	switch (action) {
		case 'OFFER_HINT':
			tutorState.set('HINT_OFFERED');
			break;
		case 'REVEAL_PARTIAL_THEORY':
			tutorState.set('REVEAL_THEORY');
			break;
		case 'SUGGEST_DECOMPOSE':
		case 'OFFER_PREREQUISITE_PATH':
			tutorState.set('DEEPER_DIVE');
			break;
		case 'FAST_TRACK':
			tutorState.set('CONCEPT_UNLOCKED');
			break;
	}
}

// ─── Composite tutorStore (used by components) ───────────────

/**
 * Value emitted by the composite tutorStore.
 */
export interface TutorStoreValue {
	state: TutorState;
	messages: TutorMessage[];
	visible: boolean;
	context: LearnerContext;
}

const _derivedStore = derived(
	[tutorState, tutorMessages, tutorVisible, learnerContext],
	([$state, $messages, $visible, $context]): TutorStoreValue => ({
		state: $state,
		messages: $messages,
		visible: $visible,
		context: $context
	})
);

/**
 * Composite tutor store — subscribable with convenience methods.
 * Components import this as `tutorStore`.
 */
export const tutorStore = {
	subscribe: _derivedStore.subscribe,

	/** Transition the tutor state machine to a new state. */
	transitionTo(state: TutorState): void {
		tutorState.set(state);
	},

	/** Record a code execution attempt (delegates to module-level recordAttempt). */
	recordAttempt(result: unknown): void {
		const correct = !!(result && typeof result === 'object' && 'success' in result && (result as Record<string, unknown>).success);
		recordAttempt(correct);
	},

	/** Mark hint as used. */
	useHint,

	/** Start tracking a new step. */
	startStep,

	/** Complete current step. */
	completeStep,

	/** Reset tutor. */
	reset: resetTutor
};
