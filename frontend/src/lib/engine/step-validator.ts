import type { ChallengeContent, Step } from '$types/path';
import type { ExecutionResult } from '$types/execution';

export interface ValidationResult {
	correct: boolean;
	feedback?: string;
}

/**
 * Validate a user's code submission against step expectations.
 * Accepts the full Step object, the current editor code, and the execution result.
 */
export function validateStep(
	step: Step,
	code: string,
	executionResult: ExecutionResult
): ValidationResult {
	if (step.type !== 'challenge') {
		return { correct: true };
	}

	const challenge = step.content as ChallengeContent;

	// Priority 1: Regex validation against code
	if (challenge.validationRegex) {
		try {
			const regex = new RegExp(challenge.validationRegex);
			if (regex.test(code)) {
				return { correct: true };
			}
			return {
				correct: false,
				feedback: challenge.errorMessage || 'Your code doesn\'t match the expected pattern.'
			};
		} catch {
			// If regex is invalid, fall through to output check
		}
	}

	// Priority 2: Expected fix match
	if (challenge.expectedFix) {
		if (code.includes(challenge.expectedFix)) {
			return { correct: true };
		}
	}

	// Priority 3: Successful execution with no errors
	if (executionResult.success && !executionResult.error) {
		return { correct: true };
	}

	// Failed
	return {
		correct: false,
		feedback: executionResult.error || 'Something went wrong. Try again.'
	};
}

/**
 * Validate output with exact match comparison.
 */
export function validateOutput(actual: string, expected: string): boolean {
	return actual.trim() === expected.trim();
}

/**
 * Validate output with regex pattern.
 */
export function validateOutputRegex(output: string, pattern: string): boolean {
	try {
		return new RegExp(pattern).test(output);
	} catch {
		return false;
	}
}
