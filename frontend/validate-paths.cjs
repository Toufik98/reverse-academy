const { z } = require('zod');

const stepTypeSchema = z.enum(['challenge', 'reveal', 'sandbox', 'theory']);
const pathModeSchema = z.enum(['problem-first', 'fix-broken', 'goal-tree']);
const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
const domainSchema = z.enum(['programming', 'web-dev', 'systems', 'stem', 'languages']);

const challengeContentSchema = z.object({
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

const revealContentSchema = z.object({
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

const sandboxContentSchema = z.object({
  type: z.literal('sandbox'),
  initialCode: z.string(),
  language: z.string().min(1),
  prompt: z.string().min(1)
});

const theoryContentSchema = z.object({
  type: z.literal('theory'),
  content: z.string().min(10),
  expandableSections: z.array(z.object({
    title: z.string().min(1),
    content: z.string().min(1)
  })).optional()
});

const stepContentSchema = z.discriminatedUnion('type', [
  challengeContentSchema,
  revealContentSchema,
  sandboxContentSchema,
  theoryContentSchema
]);

const stepSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  type: stepTypeSchema,
  content: stepContentSchema,
  xpReward: z.number().int().nonnegative()
});

const learningPathSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  domain: domainSchema,
  mode: pathModeSchema,
  difficulty: difficultySchema,
  description: z.string().min(10),
  xpReward: z.number().int().positive(),
  estimatedMinutes: z.number().int().positive(),
  steps: z.array(stepSchema).min(1)
}).refine(
  (path) => path.steps.every((step, i) => step.order === i + 1),
  { message: 'Steps must be sequentially ordered starting from 1' }
).refine(
  (path) => {
    const ids = path.steps.map((s) => s.id);
    return new Set(ids).size === ids.length;
  },
  { message: 'Step IDs must be unique within a path' }
);

const files = [
  'typescript-error-detective',
  'build-rest-api-backward',
  'rust-ownership-from-bugs',
  'python-debug-the-pipeline',
  'sql-query-detective'
];

for (const file of files) {
  const data = require(`./src/content/en/paths/${file}.json`);
  const result = learningPathSchema.safeParse(data);
  if (!result.success) {
    console.log(`FAIL: ${file}`);
    for (const issue of result.error.issues) {
      console.log(`  path: ${issue.path.join('.')}, code: ${issue.code}, msg: ${issue.message}`);
    }
  } else {
    console.log(`PASS: ${file}`);
  }
}
