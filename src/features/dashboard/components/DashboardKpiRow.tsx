import { Card, CardContent } from '@solvera/pace-core/components';
import { formatItineraryDateRangeLabel } from '@/features/dashboard/format-itinerary-range';
import { useDashboardItineraryRange } from '@/features/dashboard/hooks/useDashboardItineraryRange';
import { useDashboardPlanningCounts } from '@/features/dashboard/hooks/useDashboardPlanningCounts';
import { useCostRollupData } from '@/features/costs/hooks/useCostRollupData';
import { computeAveragePerParticipant, formatCostAmount } from '@/features/costs/currency-format';
import { useRisks } from '@/features/risks/hooks/use-risks';

export function DashboardKpiRow() {
  const planning = useDashboardPlanningCounts();
  const itinerary = useDashboardItineraryRange();
  const { rollup } = useCostRollupData();
  const { risks } = useRisks();

  const confirmedTotal =
    planning.transport.confirmed +
    planning.accommodation.confirmed +
    planning.activity.confirmed;
  const planningTotal =
    planning.transport.total + planning.accommodation.total + planning.activity.total;

  const openRisks = risks.filter((risk) => risk.status !== 'Complete').length;

  const costTotal =
    rollup != null ? formatCostAmount(rollup.eventTotalBase, rollup.baseCurrency) : '—';
  const costPerPerson =
    rollup != null
      ? formatCostAmount(
          computeAveragePerParticipant(
            rollup.eventTotalBase,
            rollup.approvedParticipantCount
          ),
          rollup.baseCurrency
        )
      : '—';

  const itineraryLabel = formatItineraryDateRangeLabel(itinerary.visibleDateRange) ?? 'No itinerary dates';

  return (
  <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Event KPIs">
    <Card>
      <CardContent>
        <h2>Planning</h2>
        <p>{confirmedTotal} confirmed of {planningTotal}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <h2>Itinerary</h2>
        <p>{itineraryLabel}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <h2>Event cost</h2>
        <p>{costTotal}</p>
        <p>{costPerPerson} per participant</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <h2>Open risks</h2>
        <p>{openRisks}</p>
      </CardContent>
    </Card>
  </section>
  );
}
