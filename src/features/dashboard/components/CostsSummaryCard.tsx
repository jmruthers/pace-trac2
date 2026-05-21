import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import {
  computeAveragePerParticipant,
  formatCostAmount,
} from '@/features/costs/currency-format';
import { useCostRollupData } from '@/features/costs/hooks/useCostRollupData';

export function CostsSummaryCard() {
  const { rollup, baseCurrency, isLoading, isError, error, refetch } = useCostRollupData();

  const emptyMessage =
    rollup != null && rollup.rowBreakdowns.length === 0
      ? 'No logistics rows with cost data for this event yet.'
      : undefined;

  return (
    <DashboardCard
      title="Costs"
      viewHref="/costs"
      viewLabel="Open costs"
      isLoading={isLoading}
      isError={isError}
      errorMessage={error}
      onRetry={() => {
        void refetch();
      }}
      emptyMessage={emptyMessage}
    >
      {rollup != null && baseCurrency != null ? (
        <ul>
          <li>
            Event total: {formatCostAmount(rollup.eventTotalBase, rollup.baseCurrency)}
          </li>
          <li>
            Per approved participant (average):{' '}
            {formatCostAmount(
              computeAveragePerParticipant(rollup.eventTotalBase, rollup.approvedParticipantCount),
              rollup.baseCurrency
            )}
            {rollup.approvedParticipantCount > 0
              ? ` across ${rollup.approvedParticipantCount} approved participants`
              : ' (no approved participants)'}
          </li>
        </ul>
      ) : null}
    </DashboardCard>
  );
}
