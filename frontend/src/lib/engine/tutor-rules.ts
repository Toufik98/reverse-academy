import type { TutorRule, LearnerContext, TutorAction } from '$types/tutor';

/**
 * Tutor rules engine — evaluates learner context and returns
 * the highest-priority applicable action.
 */
export const TUTOR_RULES: TutorRule[] = [
	{
		condition: (ctx: LearnerContext) => ctx.correctAnswer && ctx.attempts === 1,
		action: 'FAST_TRACK',
		priority: 30
	},
	{
		condition: (ctx: LearnerContext) => ctx.consecutiveFailures >= 3,
		action: 'OFFER_PREREQUISITE_PATH',
		priority: 25
	},
	{
		condition: (ctx: LearnerContext) => ctx.attempts >= 5,
		action: 'REVEAL_PARTIAL_THEORY',
		priority: 20
	},
	{
		condition: (ctx: LearnerContext) => ctx.timeOnStep > 120_000,
		action: 'SUGGEST_DECOMPOSE',
		priority: 15
	},
	{
		condition: (ctx: LearnerContext) => ctx.attempts >= 3 && !ctx.hintUsed,
		action: 'OFFER_HINT',
		priority: 10
	}
];

/**
 * Evaluate all rules against the learner context.
 * Returns the highest priority action that matches, or null.
 */
export function evaluateTutorRules(ctx: LearnerContext): TutorAction | null {
	const matchingRules = TUTOR_RULES.filter((rule) => rule.condition(ctx));

	if (matchingRules.length === 0) return null;

	// Sort by priority descending, return highest
	matchingRules.sort((a, b) => b.priority - a.priority);
	return matchingRules[0].action;
}
