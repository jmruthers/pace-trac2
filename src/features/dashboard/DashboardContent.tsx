import { Alert, Button, LoadingSpinner } from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { AssignmentsLinkCard } from '@/features/dashboard/components/AssignmentsLinkCard';
import { ContactsSummaryCard } from '@/features/dashboard/components/ContactsSummaryCard';
import { CostsSummaryCard } from '@/features/dashboard/components/CostsSummaryCard';
import { DashboardAttentionSection } from '@/features/dashboard/components/DashboardAttentionSection';
import { DashboardEventHero } from '@/features/dashboard/components/DashboardEventHero';
import { DashboardKpiRow } from '@/features/dashboard/components/DashboardKpiRow';
import { ItinerarySummaryCard } from '@/features/dashboard/components/ItinerarySummaryCard';
import { JournalSummaryCard } from '@/features/dashboard/components/JournalSummaryCard';
import { PlanningSummaryCard } from '@/features/dashboard/components/PlanningSummaryCard';
import { useDashboardEventHeader } from '@/features/dashboard/hooks/useDashboardEventHeader';

export function DashboardContent() {
  usePaceMain({ printTitle: 'Dashboard' });

  const { header, isLoading, isError, error, refetch } = useDashboardEventHeader();

  if (isLoading) {
    return (
      <main className="grid min-h-[50vh] place-items-center px-4" aria-busy="true">
        <LoadingSpinner label="Loading dashboard…" />
      </main>
    );
  }

  if (isError || header == null) {
    return (
      <main>
        <Alert variant="destructive" role="alert">
          <p>{error ?? 'Event details could not be loaded.'}</p>
          <fieldset className="text-right">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </Button>
          </fieldset>
        </Alert>
      </main>
    );
  }

  return (
    <main className="grid gap-6">
      <DashboardEventHero header={header} />
      <DashboardKpiRow />
      <DashboardAttentionSection />
      <h2>Additional information</h2>
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Event summary"
      >
          <PlanningSummaryCard />
          <ItinerarySummaryCard />
          <CostsSummaryCard />
          <ContactsSummaryCard />
          <AssignmentsLinkCard />
          <JournalSummaryCard />
        </section>
    </main>
  );
}
