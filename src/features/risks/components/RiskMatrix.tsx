import { Card, CardContent, CardHeader, CardTitle } from '@solvera/pace-core/components';
import { RISK_CONSEQUENCE_VALUES } from '@/features/risks/enums/risk-consequence';
import { RISK_LIKELIHOOD_VALUES } from '@/features/risks/enums/risk-likelihood';
import type { Risk } from '@/features/risks/types';

function buildMatrixCounts(risks: readonly Risk[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const risk of risks) {
    const key = `${risk.likelihood_after}:${risk.consequence_after}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function RiskMatrix({ risks }: { risks: readonly Risk[] }) {
  const counts = buildMatrixCounts(risks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residual risk matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <table>
          <thead>
            <tr>
              <th>Likelihood</th>
              {RISK_CONSEQUENCE_VALUES.map((consequence) => (
                <th key={consequence}>{consequence}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RISK_LIKELIHOOD_VALUES.map((likelihood) => (
              <tr key={likelihood}>
                <th>{likelihood}</th>
                {RISK_CONSEQUENCE_VALUES.map((consequence) => {
                  const count = counts.get(`${likelihood}:${consequence}`) ?? 0;
                  return <td key={consequence}>{count > 0 ? count : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
