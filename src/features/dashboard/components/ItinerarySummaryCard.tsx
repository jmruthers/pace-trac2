import { formatItineraryDateRangeLabel } from '@/features/dashboard/format-itinerary-range';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { useDashboardItineraryRange } from '@/features/dashboard/hooks/useDashboardItineraryRange';

export function ItinerarySummaryCard() {
  const { visibleDateRange, isLoading, isError, error, refetch } = useDashboardItineraryRange();
  const rangeLabel = formatItineraryDateRangeLabel(visibleDateRange);

  return (
    <DashboardCard
      title="Itinerary"
      viewHref="/itinerary"
      viewLabel="Open itinerary"
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message ?? null}
      onRetry={refetch}
      emptyMessage={rangeLabel == null ? 'No itinerary dates yet for this event.' : undefined}
    >
      {rangeLabel != null ? (
        <p>
          Visible dates: <strong>{rangeLabel}</strong>
        </p>
      ) : null}
    </DashboardCard>
  );
}
