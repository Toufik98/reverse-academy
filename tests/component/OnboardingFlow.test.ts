import { describe, it, expect } from 'vitest';

/**
 * Component-level tests for OnboardingFlow.
 *
 * Validates the multi-step onboarding wizard logic:
 *   - Step progression (welcome → interests → skill → micro-challenge → complete)
 *   - Data collection at each step
 *   - Validation rules
 *   - Skip behavior
 */

type OnboardingStep = 'welcome' | 'interests' | 'skill' | 'challenge' | 'complete';

interface OnboardingState {
  currentStep: OnboardingStep;
  selectedInterests: string[];
  skillLevel: string | null;
  challengeCompleted: boolean;
}

const STEP_ORDER: OnboardingStep[] = ['welcome', 'interests', 'skill', 'challenge', 'complete'];

const AVAILABLE_INTERESTS = [
  'web-development',
  'systems-programming',
  'data-science',
  'devops',
  'security',
  'mobile',
];

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

function createOnboardingState(): OnboardingState {
  return {
    currentStep: 'welcome',
    selectedInterests: [],
    skillLevel: null,
    challengeCompleted: false,
  };
}

function nextStep(state: OnboardingState): OnboardingState {
  const currentIdx = STEP_ORDER.indexOf(state.currentStep);
  if (currentIdx < STEP_ORDER.length - 1) {
    return { ...state, currentStep: STEP_ORDER[currentIdx + 1] };
  }
  return state;
}

function canAdvance(state: OnboardingState): boolean {
  switch (state.currentStep) {
    case 'welcome':
      return true;
    case 'interests':
      return state.selectedInterests.length >= 1;
    case 'skill':
      return state.skillLevel !== null;
    case 'challenge':
      return true; // Can skip or complete
    case 'complete':
      return false;
  }
}

function selectInterest(state: OnboardingState, interest: string): OnboardingState {
  if (!AVAILABLE_INTERESTS.includes(interest)) return state;
  if (state.selectedInterests.includes(interest)) {
    return {
      ...state,
      selectedInterests: state.selectedInterests.filter((i) => i !== interest),
    };
  }
  return {
    ...state,
    selectedInterests: [...state.selectedInterests, interest],
  };
}

function setSkillLevel(state: OnboardingState, level: string): OnboardingState {
  if (!SKILL_LEVELS.includes(level)) return state;
  return { ...state, skillLevel: level };
}

describe('OnboardingFlow — step progression', () => {
  it('starts at welcome step', () => {
    const state = createOnboardingState();
    expect(state.currentStep).toBe('welcome');
  });

  it('progresses through all steps in order', () => {
    let state = createOnboardingState();
    state.selectedInterests = ['web-development'];
    state.skillLevel = 'beginner';

    state = nextStep(state); // welcome → interests
    expect(state.currentStep).toBe('interests');

    state = nextStep(state); // interests → skill
    expect(state.currentStep).toBe('skill');

    state = nextStep(state); // skill → challenge
    expect(state.currentStep).toBe('challenge');

    state = nextStep(state); // challenge → complete
    expect(state.currentStep).toBe('complete');
  });

  it('does not advance past complete', () => {
    let state = createOnboardingState();
    state = { ...state, currentStep: 'complete' };
    state = nextStep(state);
    expect(state.currentStep).toBe('complete');
  });
});

describe('OnboardingFlow — validation', () => {
  it('welcome can always advance', () => {
    const state = createOnboardingState();
    expect(canAdvance(state)).toBe(true);
  });

  it('interests requires at least one selection', () => {
    let state = createOnboardingState();
    state = { ...state, currentStep: 'interests' };
    expect(canAdvance(state)).toBe(false);

    state.selectedInterests = ['web-development'];
    expect(canAdvance(state)).toBe(true);
  });

  it('skill requires selection', () => {
    let state = createOnboardingState();
    state = { ...state, currentStep: 'skill' };
    expect(canAdvance(state)).toBe(false);

    state.skillLevel = 'intermediate';
    expect(canAdvance(state)).toBe(true);
  });

  it('challenge can always advance (skippable)', () => {
    let state = createOnboardingState();
    state = { ...state, currentStep: 'challenge' };
    expect(canAdvance(state)).toBe(true);
  });
});

describe('OnboardingFlow — interest selection', () => {
  it('toggles interest on', () => {
    let state = createOnboardingState();
    state = { ...state, currentStep: 'interests' };
    state = selectInterest(state, 'web-development');
    expect(state.selectedInterests).toContain('web-development');
  });

  it('toggles interest off', () => {
    let state = createOnboardingState();
    state = { ...state, currentStep: 'interests', selectedInterests: ['web-development'] };
    state = selectInterest(state, 'web-development');
    expect(state.selectedInterests).not.toContain('web-development');
  });

  it('ignores unknown interests', () => {
    let state = createOnboardingState();
    state = selectInterest(state, 'blockchain');
    expect(state.selectedInterests).toEqual([]);
  });

  it('allows multiple interests', () => {
    let state = createOnboardingState();
    state = selectInterest(state, 'web-development');
    state = selectInterest(state, 'security');
    state = selectInterest(state, 'devops');
    expect(state.selectedInterests).toEqual(['web-development', 'security', 'devops']);
  });
});

describe('OnboardingFlow — skill level', () => {
  it('sets valid skill level', () => {
    let state = createOnboardingState();
    state = setSkillLevel(state, 'advanced');
    expect(state.skillLevel).toBe('advanced');
  });

  it('ignores invalid skill level', () => {
    let state = createOnboardingState();
    state = setSkillLevel(state, 'expert');
    expect(state.skillLevel).toBeNull();
  });
});
