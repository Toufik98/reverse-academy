import { describe, it, expect } from 'vitest';

// XP calculation formula from PLAN.md
function calculateStepXp(
  baseXp: number,
  attempts: number,
  hintsUsed: boolean,
  secondsTaken?: number,
  targetSeconds?: number
): number {
  let xp = baseXp;

  // First attempt bonus (2x)
  if (attempts <= 1) xp *= 2.0;

  // No hints bonus (1.5x)
  if (!hintsUsed) xp *= 1.5;

  // Speed bonus (1.3x)
  if (secondsTaken !== undefined && targetSeconds !== undefined && secondsTaken < targetSeconds) {
    xp *= 1.3;
  }

  return Math.round(xp);
}

// Level calculation: level = floor(sqrt(xp / 100)) + 1
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

describe('XP Calculator', () => {
  it('awards 2x for first attempt', () => {
    expect(calculateStepXp(10, 1, true)).toBe(20);
  });

  it('awards 1.5x for no hints', () => {
    expect(calculateStepXp(10, 2, false)).toBe(15);
  });

  it('stacks first attempt + no hints (3x)', () => {
    expect(calculateStepXp(10, 1, false)).toBe(30);
  });

  it('stacks all multipliers (2 × 1.5 × 1.3 = 3.9x)', () => {
    expect(calculateStepXp(10, 1, false, 30, 60)).toBe(39);
  });

  it('gives base XP only for multiple attempts with hints', () => {
    expect(calculateStepXp(10, 3, true)).toBe(10);
  });

  it('no speed bonus when over target time', () => {
    expect(calculateStepXp(10, 1, false, 90, 60)).toBe(30);
  });

  it('handles zero base XP', () => {
    expect(calculateStepXp(0, 1, false)).toBe(0);
  });
});

describe('Level Calculator', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns level 2 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it('returns level 3 at 400 XP', () => {
    expect(calculateLevel(400)).toBe(3);
  });

  it('returns level 4 at 900 XP', () => {
    expect(calculateLevel(900)).toBe(4);
  });

  it('returns level 5 at 1600 XP', () => {
    expect(calculateLevel(1600)).toBe(5);
  });

  it('stays at level 1 for XP < 100', () => {
    expect(calculateLevel(50)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
  });
});
