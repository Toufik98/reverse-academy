import { z } from 'zod';

// Step types
export const stepTypeSchema = z.enum(['challenge', 'reveal', 'sandbox', 'theory']);
export const pathModeSchema = z.enum(['problem-first', 'fix-broken', 'goal-tree']);
export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const domainSchema = z.enum(['programming', 'web-dev', 'systems', 'stem', 'languages']);

// Content schemas for each step type
export const challengeContentSchema = z.object({
	type: z.literal('challenge'),
	scenario: z.string().min(10),
	code: z.string().min(1),
	language: z.string().min(1),
	expectedFix: z.string().optional(),
	validationRegex: z.string().optional(),
	errorMessage: z.string().optional(),
	hint: z.string().optional(),
	expectedConcepts: z.array(z.string()).optional()
});

export const revealContentSchema = z.object({
	type: z.literal('reveal'),
	theory: z.string().min(10),
	keyInsight: z.string().min(10),
	formula: z.string().nullable().optional(),
	interactiveDemo: z.object({
		type: z.string(),
		initialCode: z.string(),
		prompt: z.string()
	}).optional(),
	expandableSections: z.array(z.object({
		title: z.string().min(1),
		content: z.string().min(1)
	})).optional()
});

export const sandboxContentSchema = z.object({
	type: z.literal('sandbox'),
	initialCode: z.string(),
	language: z.string().min(1),
	prompt: z.string().min(1)
});

export const theoryContentSchema = z.object({
	type: z.literal('theory'),
	content: z.string().min(10),
	expandableSections: z.array(z.object({
		title: z.string().min(1),
		content: z.string().min(1)
	})).optional()
});

export const stepContentSchema = z.discriminatedUnion('type', [
	challengeContentSchema,
	revealContentSchema,
	sandboxContentSchema,
	theoryContentSchema
]);

// Step schema
export const stepSchema = z.object({
	id: z.string().min(1),
	order: z.number().int().positive(),
	title: z.string().min(1),
	type: stepTypeSchema,
	content: stepContentSchema,
	xpReward: z.number().int().nonnegative()
});

// Learning path schema
export const learningPathSchema = z.object({
	id: z.string().min(1),
	slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
	title: z.string().min(1),
	domain: domainSchema,
	mode: pathModeSchema,
	difficulty: difficultySchema,
	description: z.string().min(10),
	xpReward: z.number().int().positive(),
	estimatedMinutes: z.number().int().positive(),
	steps: z.array(stepSchema).min(1)
}).refine(
	(path) => {
		// Verify steps are ordered correctly
		return path.steps.every((step, i) => step.order === i + 1);
	},
	{ message: 'Steps must be sequentially ordered starting from 1' }
).refine(
	(path) => {
		// Verify step IDs are unique
		const ids = path.steps.map((s) => s.id);
		return new Set(ids).size === ids.length;
	},
	{ message: 'Step IDs must be unique within a path' }
);

// Domain info schema
export const domainInfoSchema = z.object({
	id: domainSchema,
	name: z.string().min(1),
	description: z.string().min(1),
	icon: z.string().min(1),
	pathCount: z.number().int().nonnegative()
});

// Achievement schema
export const achievementSchema = z.object({
	id: z.string().min(1),
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().min(1),
	icon: z.string().min(1),
	xpBonus: z.number().int().nonnegative(),
	criteriaJson: z.string().min(2)
});

// Collection schemas
export const domainsSchema = z.array(domainInfoSchema).min(1);
export const achievementsSchema = z.array(achievementSchema).min(1);

// Export types derived from schemas
export type ValidatedPath = z.infer<typeof learningPathSchema>;
export type ValidatedStep = z.infer<typeof stepSchema>;
export type ValidatedDomain = z.infer<typeof domainInfoSchema>;
export type ValidatedAchievement = z.infer<typeof achievementSchema>;
