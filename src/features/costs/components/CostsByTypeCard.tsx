import { useMemo } from 'react';
import { Card, CardContent } from '@solvera/pace-core/components';
import { formatResourceTypeLabel } from '@/features/costs/cost-labels';
import { formatCostAmount } from '@/features/costs/currency-format';
import type { CostRollupResult } from '@/features/costs/types';
import type { LogisticsResourceKind } from '@/features/planning/types';

interface TypeBreakdown {
  resourceType: LogisticsResourceKind;
  totalBase: number;
  sharePercent: number;
}

function buildTypeBreakdowns(rollup: CostRollupResult): TypeBreakdown[] {
  const totals: Record<LogisticsResourceKind, number> = {
    transport: 0,
    accommodation: 0,
    activity: 0,
  };

  for (const row of rollup.rowBreakdowns) {
    const base = row.rowTotalBase ?? 0;
    totals[row.resourceType] += base;
  }

  const eventTotal = rollup.eventTotalBase;
  return (['transport', 'accommodation', 'activity'] as const).map((resourceType) => {
    const totalBase = totals[resourceType];
    const sharePercent =
      eventTotal > 0 ? Math.round((totalBase / eventTotal) * 100) : 0;
    return { resourceType, totalBase, sharePercent };
  });
}

export function CostsByTypeCard({ rollup }: { rollup: CostRollupResult }) {
  const breakdowns = useMemo(() => buildTypeBreakdowns(rollup), [rollup]);

  return (
    <Card>
      <CardContent className="grid gap-4">
        <h2>By resource type</h2>
        <ul className="grid gap-3">
          {breakdowns.map((row) => (
            <li key={row.resourceType}>
              <article className="grid gap-1">
                <strong>{formatResourceTypeLabel(row.resourceType)}</strong>
                <p>
                  {formatCostAmount(row.totalBase, rollup.baseCurrency)} ({row.sharePercent}%)
                </p>
              </article>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
