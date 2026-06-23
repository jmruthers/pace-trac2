import { describe, it, expect } from 'vitest';
import { deriveCostBasis } from '@/features/planning/components/PlanningFormFields';

describe('deriveCostBasis', () => {
  it('prefers individual cost when set', () => {
    expect(deriveCostBasis(25, null)).toBe('individual');
    expect(deriveCostBasis(25, 500)).toBe('individual');
  });

  it('uses group when only group cost is set', () => {
    expect(deriveCostBasis(null, 500)).toBe('group');
    expect(deriveCostBasis(0, 500)).toBe('group');
  });

  it('defaults to individual when neither is set', () => {
    expect(deriveCostBasis(null, null)).toBe('individual');
  });
});
