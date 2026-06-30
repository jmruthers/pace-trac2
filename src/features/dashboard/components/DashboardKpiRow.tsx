import type { ReactNode } from 'react';
import { Card, CardContent, LoadingSpinner } from '@solvera/pace-core/components';
import { formatItineraryDateRangeLabel } from '@/features/dashboard/format-itinerary-range';
import type { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { computeAveragePerParticipant, formatCostAmount } from '@/features/costs/currency-format';

type DashboardSummaryState = ReturnType<typeof useDashboardSummary>;

interface DashboardKpiRowProps {
  summaryState: DashboardSummaryState;
}

function KpiCard({
  title,
  isLoading,
  children,
}: {
  title: string;
  isLoading: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <h2>{title}</h2>
        {isLoading ? (
          <LoadingSpinner label={`Loading ${title.toLowerCase()}…`} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardKpiRow({ summaryState }: DashboardKpiRowProps) {
  const { summary, isLoading } = summaryState;

  const planning = summary?.planning;
  const confirmedTotal =
    (planning?.transport.confirmed ?? 0) +
    (planning?.accommodation.confirmed ?? 0) +
    (planning?.activity.confirmed ?? 0);
  const planningTotal =
    (planning?.transport.total ?? 0) +
    (planning?.accommodation.total ?? 0) +
    (planning?.activity.total ?? 0);

  const rollup = summary?.rollup ?? null;
  const costTotal =
    rollup != null ? formatCostAmount(rollup.eventTotalBase, rollup.baseCurrency) : '—';
  const costPerPerson =
    rollup != null
      ? formatCostAmount(
          computeAveragePerParticipant(rollup.eventTotalBase, rollup.approvedParticipantCount),
          rollup.baseCurrency
        )
      : '—';

  const itineraryLabel =
    summary?.visibleDateRange != null
      ? formatItineraryDateRangeLabel(summary.visibleDateRange) ?? 'No itinerary dates'
      : 'No itinerary dates';

  const openRisks = summary?.openRisks ?? 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Event KPIs">
      <KpiCard title="Planning" isLoading={isLoading}>
        <p>
          {confirmedTotal} confirmed of {planningTotal}
        </p>
      </KpiCard>
      <KpiCard title="Itinerary" isLoading={isLoading}>
        <p>{itineraryLabel}</p>
      </KpiCard>
      <KpiCard title="Event cost" isLoading={isLoading}>
        <p>{costTotal}</p>
        <p>{costPerPerson} per participant</p>
      </KpiCard>
      <KpiCard title="Open risks" isLoading={isLoading}>
        <p>{openRisks}</p>
      </KpiCard>
    </section>
  );
}
