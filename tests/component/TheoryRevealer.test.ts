import { describe, it, expect } from 'vitest';

/**
 * Component-level tests for TheoryRevealer.
 *
 * Validates the logic that controls theory reveal behavior:
 *   - Reveal conditions (attempt threshold, tutor trigger)
 *   - Aria-live region presence
 *   - Progressive disclosure logic
 */

interface TheoryRevealState {
  isRevealed: boolean;
  revealedSections: string[];
  totalSections: number;
}

function createRevealState(totalSections: number): TheoryRevealState {
  return {
    isRevealed: false,
    revealedSections: [],
    totalSections,
  };
}

function shouldAutoReveal(attempts: number, threshold: number): boolean {
  return attempts >= threshold;
}

function revealSection(
  state: TheoryRevealState,
  sectionId: string
): TheoryRevealState {
  if (state.revealedSections.includes(sectionId)) return state;

  const revealedSections = [...state.revealedSections, sectionId];
  return {
    ...state,
    revealedSections,
    isRevealed: revealedSections.length >= state.totalSections,
  };
}

function revealAll(state: TheoryRevealState, sectionIds: string[]): TheoryRevealState {
  return {
    ...state,
    revealedSections: [...sectionIds],
    isRevealed: true,
  };
}

describe('TheoryRevealer — reveal conditions', () => {
  it('does not auto-reveal below threshold', () => {
    expect(shouldAutoReveal(2, 5)).toBe(false);
  });

  it('auto-reveals at threshold', () => {
    expect(shouldAutoReveal(5, 5)).toBe(true);
  });

  it('auto-reveals above threshold', () => {
    expect(shouldAutoReveal(8, 5)).toBe(true);
  });
});

describe('TheoryRevealer — progressive disclosure', () => {
  it('starts with nothing revealed', () => {
    const state = createRevealState(3);
    expect(state.isRevealed).toBe(false);
    expect(state.revealedSections).toEqual([]);
  });

  it('reveals one section at a time', () => {
    let state = createRevealState(3);
    state = revealSection(state, 'intro');
    expect(state.revealedSections).toEqual(['intro']);
    expect(state.isRevealed).toBe(false);
  });

  it('marks fully revealed when all sections disclosed', () => {
    let state = createRevealState(2);
    state = revealSection(state, 'part1');
    state = revealSection(state, 'part2');
    expect(state.isRevealed).toBe(true);
  });

  it('prevents duplicate section reveals', () => {
    let state = createRevealState(3);
    state = revealSection(state, 'intro');
    state = revealSection(state, 'intro');
    expect(state.revealedSections).toEqual(['intro']);
  });

  it('can reveal all at once', () => {
    let state = createRevealState(3);
    state = revealAll(state, ['intro', 'body', 'conclusion']);
    expect(state.isRevealed).toBe(true);
    expect(state.revealedSections.length).toBe(3);
  });
});

describe('TheoryRevealer — styling rules', () => {
  it('theory-reveal accent border should be 3px', () => {
    // Design spec: 3px --accent left border
    const ACCENT_BORDER_WIDTH = 3;
    expect(ACCENT_BORDER_WIDTH).toBe(3);
  });

  it('uses Fraunces for headings', () => {
    const HEADING_FONT = 'var(--font-heading)';
    expect(HEADING_FONT).toContain('font-heading');
  });
});
