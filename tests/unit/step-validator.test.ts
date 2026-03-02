import { describe, it, expect } from 'vitest';

type StepType = 'challenge' | 'reveal' | 'exercise' | 'quiz';

interface Step {
  id: string;
  order: number;
  type: StepType;
  code?: string;
  validationRegex?: string;
  expectedOutput?: string;
}

interface ValidationResult {
  valid: boolean;
  message: string;
}

function validateStepAnswer(step: Step, answer: string): ValidationResult {
  if (!answer || answer.trim().length === 0) {
    return { valid: false, message: 'Answer cannot be empty' };
  }

  // Regex-based validation (primary method for challenges)
  if (step.validationRegex) {
    try {
      const regex = new RegExp(step.validationRegex, 's');
      if (regex.test(answer)) {
        return { valid: true, message: 'Correct!' };
      } else {
        return { valid: false, message: 'Not quite right. Check your code and try again.' };
      }
    } catch {
      return { valid: false, message: 'Validation error. Please try again.' };
    }
  }

  // Output-based validation
  if (step.expectedOutput) {
    const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
    const normalizedExpected = step.expectedOutput.trim().replace(/\s+/g, ' ');
    if (normalizedAnswer === normalizedExpected) {
      return { valid: true, message: 'Correct!' };
    } else {
      return { valid: false, message: 'Output does not match expected result.' };
    }
  }

  // Reveal steps are always valid (learner just reads)
  if (step.type === 'reveal') {
    return { valid: true, message: 'Concept unlocked!' };
  }

  return { valid: false, message: 'No validation criteria defined for this step.' };
}

describe('Step Validator', () => {
  it('rejects empty answers', () => {
    const step: Step = { id: 's1', order: 1, type: 'challenge', validationRegex: 'hello' };
    expect(validateStepAnswer(step, '').valid).toBe(false);
    expect(validateStepAnswer(step, '   ').valid).toBe(false);
  });

  it('validates against regex pattern', () => {
    const step: Step = {
      id: 's1',
      order: 1,
      type: 'challenge',
      validationRegex: 'function\\s+greet\\s*\\(',
    };
    expect(validateStepAnswer(step, 'function greet() { return "hi"; }').valid).toBe(true);
    expect(validateStepAnswer(step, 'const greet = () => "hi"').valid).toBe(false);
  });

  it('validates against expected output', () => {
    const step: Step = {
      id: 's1',
      order: 1,
      type: 'challenge',
      expectedOutput: 'Hello, World!',
    };
    expect(validateStepAnswer(step, 'Hello, World!').valid).toBe(true);
    expect(validateStepAnswer(step, 'Hello,  World!').valid).toBe(true); // normalized whitespace
    expect(validateStepAnswer(step, 'Hello World').valid).toBe(false);
  });

  it('auto-validates reveal steps', () => {
    const step: Step = { id: 's1', order: 1, type: 'reveal' };
    expect(validateStepAnswer(step, 'anything').valid).toBe(true);
  });

  it('handles invalid regex gracefully', () => {
    const step: Step = {
      id: 's1',
      order: 1,
      type: 'challenge',
      validationRegex: '[invalid(',
    };
    const result = validateStepAnswer(step, 'some code');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Validation error');
  });

  it('regex validates multiline code', () => {
    const step: Step = {
      id: 's1',
      order: 1,
      type: 'challenge',
      validationRegex: 'interface\\s+User.*name:\\s*string',
    };
    const code = `interface User {\n  name: string;\n  age: number;\n}`;
    expect(validateStepAnswer(step, code).valid).toBe(true);
  });
});
