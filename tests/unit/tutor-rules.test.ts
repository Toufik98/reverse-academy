import { describe, it, expect } from 'vitest';

interface TutorState {
  state: 'idle' | 'problem_presented' | 'attempting' | 'hint_offered' | 'deeper_dive' | 'reveal_theory' | 'concept_unlocked' | 'next_step' | 'path_complete';
  attempts: number;
  hintsUsed: number;
  timeSpent: number;       // seconds on current step
  consecutiveFailures: number;
}

interface TutorRule {
  name: string;
  priority: number;
  condition: (state: TutorState) => boolean;
  action: string;
}

const TUTOR_RULES: TutorRule[] = [
  {
    name: 'FAST_TRACK',
    priority: 30,
    condition: (s) => s.state === 'attempting' && s.attempts === 1 && s.consecutiveFailures === 0,
    action: 'reveal_theory',
  },
  {
    name: 'OFFER_PREREQUISITE_PATH',
    priority: 25,
    condition: (s) => s.consecutiveFailures >= 3,
    action: 'deeper_dive',
  },
  {
    name: 'REVEAL_PARTIAL_THEORY',
    priority: 20,
    condition: (s) => s.attempts >= 5,
    action: 'reveal_theory',
  },
  {
    name: 'SUGGEST_DECOMPOSE',
    priority: 15,
    condition: (s) => s.timeSpent > 120,
    action: 'hint_offered',
  },
  {
    name: 'OFFER_HINT',
    priority: 10,
    condition: (s) => s.attempts >= 3 && s.hintsUsed === 0,
    action: 'hint_offered',
  },
];

function evaluateRules(state: TutorState): TutorRule | null {
  const sortedRules = [...TUTOR_RULES].sort((a, b) => b.priority - a.priority);
  return sortedRules.find((rule) => rule.condition(state)) ?? null;
}

describe('Tutor Rules', () => {
  it('triggers FAST_TRACK on first correct attempt', () => {
    const state: TutorState = {
      state: 'attempting',
      attempts: 1,
      hintsUsed: 0,
      timeSpent: 10,
      consecutiveFailures: 0,
    };
    const rule = evaluateRules(state);
    expect(rule?.name).toBe('FAST_TRACK');
  });

  it('triggers OFFER_PREREQUISITE_PATH after 3 consecutive failures', () => {
    const state: TutorState = {
      state: 'attempting',
      attempts: 3,
      hintsUsed: 0,
      timeSpent: 60,
      consecutiveFailures: 3,
    };
    const rule = evaluateRules(state);
    expect(rule?.name).toBe('OFFER_PREREQUISITE_PATH');
  });

  it('triggers REVEAL_PARTIAL_THEORY after 5+ attempts', () => {
    const state: TutorState = {
      state: 'attempting',
      attempts: 5,
      hintsUsed: 1,
      timeSpent: 60,
      consecutiveFailures: 1,
    };
    const rule = evaluateRules(state);
    expect(rule?.name).toBe('REVEAL_PARTIAL_THEORY');
  });

  it('triggers SUGGEST_DECOMPOSE after 2+ minutes', () => {
    const state: TutorState = {
      state: 'attempting',
      attempts: 2,
      hintsUsed: 1,
      timeSpent: 150,
      consecutiveFailures: 0,
    };
    const rule = evaluateRules(state);
    expect(rule?.name).toBe('SUGGEST_DECOMPOSE');
  });

  it('triggers OFFER_HINT after 3 attempts with no hints used', () => {
    const state: TutorState = {
      state: 'attempting',
      attempts: 3,
      hintsUsed: 0,
      timeSpent: 30,
      consecutiveFailures: 0,
    };
    const rule = evaluateRules(state);
    expect(rule?.name).toBe('OFFER_HINT');
  });

  it('returns null when no rules match', () => {
    const state: TutorState = {
      state: 'idle',
      attempts: 0,
      hintsUsed: 0,
      timeSpent: 0,
      consecutiveFailures: 0,
    };
    const rule = evaluateRules(state);
    expect(rule).toBeNull();
  });

  it('respects priority ordering (higher priority wins)', () => {
    // State that matches multiple rules: 5 attempts + 3 failures + over 2min
    const state: TutorState = {
      state: 'attempting',
      attempts: 5,
      hintsUsed: 0,
      timeSpent: 150,
      consecutiveFailures: 3,
    };
    const rule = evaluateRules(state);
    // OFFER_PREREQUISITE_PATH (25) beats REVEAL_PARTIAL_THEORY (20) beats SUGGEST_DECOMPOSE (15)
    expect(rule?.name).toBe('OFFER_PREREQUISITE_PATH');
  });
});
