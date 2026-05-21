import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import {
  PLANNING_KIND_LABELS,
  useDashboardPlanningCounts,
} from '@/features/dashboard/hooks/useDashboardPlanningCounts';
import type { LogisticsResourceKind } from '@/features/planning/types';

const KINDS: LogisticsResourceKind[] = ['transport', 'accommodation', 'activity'];

export function PlanningSummaryCard() {
  const { transport, accommodation, activity, isLoading, isError, error, refetch } =
    useDashboardPlanningCounts();

  const summaries = {
    transport,
    accommodation,
    activity,
  };

  return (
    <DashboardCard
      title="Planning"
      viewHref="/planning"
      viewLabel="Open planning"
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message ?? null}
      onRetry={refetch}
    >
      <ul>
        {KINDS.map((kind) => {
          const summary = summaries[kind];
          return (
            <li key={kind}>
              {PLANNING_KIND_LABELS[kind]}: {summary.confirmed} confirmed of {summary.total}
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
