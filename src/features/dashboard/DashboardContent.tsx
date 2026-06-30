import { Alert, Button, LoadingSpinner } from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { AssignmentsLinkCard } from '@/features/dashboard/components/AssignmentsLinkCard';
import { ContactsSummaryCard } from '@/features/dashboard/components/ContactsSummaryCard';
import { DashboardAttentionSection } from '@/features/dashboard/components/DashboardAttentionSection';
import { DashboardEventHero } from '@/features/dashboard/components/DashboardEventHero';
import { DashboardKpiRow } from '@/features/dashboard/components/DashboardKpiRow';
import { JournalSummaryCard } from '@/features/dashboard/components/JournalSummaryCard';
import { MasterPlanLinkCard } from '@/features/dashboard/components/MasterPlanLinkCard';
import { useDashboardEventHeader } from '@/features/dashboard/hooks/useDashboardEventHeader';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';

function DashboardEventHeroPlaceholder() {
  return (
    <section className="grid min-h-[12rem] place-items-center" aria-busy="true" aria-label="Loading event details">
      <LoadingSpinner label="Loading event details…" />
    </section>
  );
}

export function DashboardContent() {
  usePaceMain({ printTitle: 'Dashboard' });

  const headerState = useDashboardEventHeader();
  const summaryState = useDashboardSummary();

  const showHeaderError = headerState.isError || (!headerState.isLoading && headerState.header == null);

  return (
    <main className="grid gap-6">
      {headerState.isLoading ? (
        <DashboardEventHeroPlaceholder />
      ) : showHeaderError ? (
        <Alert variant="destructive" role="alert">
          <p>{headerState.error ?? 'Event details could not be loaded.'}</p>
          <fieldset className="text-right">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void headerState.refetch();
              }}
            >
              Retry
            </Button>
          </fieldset>
        </Alert>
      ) : headerState.header ? (
        <DashboardEventHero header={headerState.header} />
      ) : null}

      {summaryState.isError ? (
        <Alert variant="destructive" role="alert">
          <p>{summaryState.error ?? 'Dashboard summary could not be loaded.'}</p>
          <fieldset className="text-right">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void summaryState.refetch();
              }}
            >
              Retry
            </Button>
          </fieldset>
        </Alert>
      ) : (
        <>
          <DashboardKpiRow summaryState={summaryState} />
          <DashboardAttentionSection summaryState={summaryState} />
        </>
      )}

      <h2>Additional information</h2>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Event summary">
        <ContactsSummaryCard />
        <AssignmentsLinkCard />
        <JournalSummaryCard />
        <MasterPlanLinkCard />
      </section>
    </main>
  );
}
