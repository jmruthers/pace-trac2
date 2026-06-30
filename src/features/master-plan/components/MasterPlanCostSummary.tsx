import { useMemo } from 'react';
import {
  computeAveragePerParticipant,
  formatCostAmount,
} from '@/features/costs/currency-format';
import type { CostRollupResult } from '@/features/costs/types';
import type { LogisticsResourceKind } from '@/features/planning/types';
import { MasterPlanSectionShell } from '@/features/master-plan/components/MasterPlanSectionShell';

const RESOURCE_LABELS: Record<LogisticsResourceKind, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activity: 'Activities',
};

function sumByResourceType(rollup: CostRollupResult): Record<LogisticsResourceKind, number> {
  const totals: Record<LogisticsResourceKind, number> = {
    transport: 0,
    accommodation: 0,
    activity: 0,
  };

  for (const row of rollup.rowBreakdowns) {
    if (row.rowTotalBase != null) {
      totals[row.resourceType] += row.rowTotalBase;
    }
  }

  return totals;
}

interface MasterPlanCostSummaryProps {
  rollup: CostRollupResult | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
}

export function MasterPlanCostSummary({
  rollup,
  isLoading,
  isError,
  errorMessage,
}: MasterPlanCostSummaryProps) {
  const byType = useMemo(() => (rollup != null ? sumByResourceType(rollup) : null), [rollup]);

  return (
    <MasterPlanSectionShell
      title="Cost summary"
      countLabel={rollup?.baseCurrency ?? undefined}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      className="grid gap-4 break-after-page"
    >
      {rollup == null || byType == null ? null : (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(byType) as LogisticsResourceKind[]).map((kind) => (
            <div key={kind}>
              <dt>{RESOURCE_LABELS[kind]}</dt>
              <dd>{formatCostAmount(byType[kind], rollup.baseCurrency)}</dd>
            </div>
          ))}
          <div>
            <dt>Total event cost</dt>
            <dd>{formatCostAmount(rollup.eventTotalBase, rollup.baseCurrency)}</dd>
          </div>
          <div>
            <dt>Per participant</dt>
            <dd>
              {formatCostAmount(
                computeAveragePerParticipant(rollup.eventTotalBase, rollup.approvedParticipantCount),
                rollup.baseCurrency
              )}
            </dd>
          </div>
        </dl>
      )}
    </MasterPlanSectionShell>
  );
}
