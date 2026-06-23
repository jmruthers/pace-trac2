import { describe, expect, it } from 'vitest';
import {
  computeImpactScore,
  consequenceRank,
  impactBand,
  likelihoodRank,
} from '@/features/risks/risk-ranks';

describe('risk-ranks', () => {
  it('maps enum values to ranks 1–5', () => {
    expect(likelihoodRank('Rare')).toBe(1);
    expect(likelihoodRank('Almost certain')).toBe(5);
    expect(consequenceRank('Insignificant')).toBe(1);
    expect(consequenceRank('Severe')).toBe(5);
  });

  it('computeImpactScore multiplies likelihood and consequence ranks', () => {
    expect(computeImpactScore('Likely', 'Major')).toBe(16);
  });

  it('impactBand maps score thresholds to bands', () => {
    expect(impactBand(0)).toBe('none');
    expect(impactBand(4)).toBe('low');
    expect(impactBand(9)).toBe('moderate');
    expect(impactBand(14)).toBe('high');
    expect(impactBand(25)).toBe('extreme');
  });
});
