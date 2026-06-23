import type { RiskConsequence } from '@/features/risks/enums/risk-consequence';
import type { RiskLikelihood } from '@/features/risks/enums/risk-likelihood';

export const LIKELIHOOD_RANK: Record<RiskLikelihood, number> = {
  Rare: 1,
  Unlikely: 2,
  Possible: 3,
  Likely: 4,
  'Almost certain': 5,
};

export const CONSEQUENCE_RANK: Record<RiskConsequence, number> = {
  Insignificant: 1,
  Minor: 2,
  Significant: 3,
  Major: 4,
  Severe: 5,
};

export type ImpactBand = 'none' | 'low' | 'moderate' | 'high' | 'extreme';

export function likelihoodRank(likelihood: RiskLikelihood): number {
  return LIKELIHOOD_RANK[likelihood];
}

export function consequenceRank(consequence: RiskConsequence): number {
  return CONSEQUENCE_RANK[consequence];
}

export function computeImpactScore(
  likelihood: RiskLikelihood,
  consequence: RiskConsequence
): number {
  return likelihoodRank(likelihood) * consequenceRank(consequence);
}

/** Impact banding for matrix heat colour: 1–4 low, 5–9 moderate, 10–14 high, 15–25 extreme. */
export function impactBand(score: number): ImpactBand {
  if (score <= 0) return 'none';
  if (score <= 4) return 'low';
  if (score <= 9) return 'moderate';
  if (score <= 14) return 'high';
  return 'extreme';
}
