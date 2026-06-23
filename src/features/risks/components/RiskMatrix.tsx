import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@solvera/pace-core/components';
import { RISK_CONSEQUENCE_VALUES } from '@/features/risks/enums/risk-consequence';
import { RISK_LIKELIHOOD_VALUES } from '@/features/risks/enums/risk-likelihood';
import {
  computeImpactScore,
  consequenceRank,
  impactBand,
  likelihoodRank,
  type ImpactBand,
} from '@/features/risks/risk-ranks';
import type { Risk } from '@/features/risks/types';

const LIKELIHOOD_ROWS = [...RISK_LIKELIHOOD_VALUES].reverse();

const MATRIX_FOOTNOTE =
  'Each cell shows how many risks sit at that residual (after-control) position — likelihood rank × consequence rank.';

const IMPACT_BAND_CELL_CLASS: Record<ImpactBand, string> = {
  none: 'bg-main-100 text-sec-500',
  low: 'bg-main-400 text-main-50',
  moderate: 'bg-acc-300 text-main-950',
  high: 'bg-acc-500 text-main-50',
  extreme: 'bg-acc-700 text-main-50',
};

function buildMatrixCounts(risks: readonly Risk[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const risk of risks) {
    const key = `${risk.likelihood_after}:${risk.consequence_after}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function matrixCellClass(
  likelihood: (typeof RISK_LIKELIHOOD_VALUES)[number],
  consequence: (typeof RISK_CONSEQUENCE_VALUES)[number],
  count: number
): string {
  if (count === 0) {
    return IMPACT_BAND_CELL_CLASS.none;
  }
  const score = computeImpactScore(likelihood, consequence);
  return IMPACT_BAND_CELL_CLASS[impactBand(score)];
}

export function RiskMatrix({ risks }: { risks: readonly Risk[] }) {
  const counts = buildMatrixCounts(risks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residual risk matrix</CardTitle>
      </CardHeader>
      <CardContent className="mx-auto w-full max-w-xl">
        <section data-testid="risk-matrix">
          <Table>
            <TableCaption>{MATRIX_FOOTNOTE}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">L ↓ / C →</TableHead>
                {RISK_CONSEQUENCE_VALUES.map((consequence) => (
                  <TableHead key={consequence} scope="col">
                    {consequence}
                    <br />
                    ({consequenceRank(consequence)})
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {LIKELIHOOD_ROWS.map((likelihood) => (
                <TableRow key={likelihood}>
                  <TableHead scope="row">
                    {likelihood}
                    <br />
                    ({likelihoodRank(likelihood)})
                  </TableHead>
                  {RISK_CONSEQUENCE_VALUES.map((consequence) => {
                    const count = counts.get(`${likelihood}:${consequence}`) ?? 0;
                    return (
                      <TableCell
                        key={consequence}
                        className={matrixCellClass(likelihood, consequence, count)}
                      >
                        {count > 0 ? count : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </CardContent>
    </Card>
  );
}
