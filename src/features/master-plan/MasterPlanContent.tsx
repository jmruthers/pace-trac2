import { useEffect } from 'react';
import {
  Alert,
  LoadingSpinner,
  PageHeader,
} from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { usePageCan } from '@solvera/pace-core/rbac';
import { APP_NAME } from '@/app-config';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { useContacts } from '@/features/contacts/hooks/use-contacts';
import { useCostRollupData } from '@/features/costs/hooks/useCostRollupData';
import { MasterPlanContactsList } from '@/features/master-plan/components/MasterPlanContactsList';
import { MasterPlanCostSummary } from '@/features/master-plan/components/MasterPlanCostSummary';
import { MasterPlanHeader } from '@/features/master-plan/components/MasterPlanHeader';
import { MasterPlanItinerarySection } from '@/features/master-plan/components/MasterPlanItinerarySection';
import { MasterPlanJourneyMap } from '@/features/master-plan/components/MasterPlanJourneyMap';
import { useMasterPlanEventHeader } from '@/features/master-plan/hooks/useMasterPlanEventHeader';
import { useMasterPlanViewModel } from '@/features/master-plan/hooks/useMasterPlanViewModel';
import { GoogleMapsPlanningProvider } from '@/features/planning/context/GoogleMapsPlanningContext';

export function MasterPlanContent() {
  usePaceMain({ printTitle: 'Master plan' });
  const breadcrumbItems = useTracEventBreadcrumbs('Master plan');
  const headerState = useMasterPlanEventHeader();
  const viewModel = useMasterPlanViewModel();
  const contactsState = useContacts();
  const costState = useCostRollupData();
  const { can: canReadPlanning } = usePageCan(TRAC_PAGE_NAMES.planning, 'read');

  useEffect(() => {
    if (headerState.header == null) return;
    const root = document.documentElement;
    root.style.setProperty('--print-title', '"Master plan"');
    root.style.setProperty('--print-event-name', `"${headerState.header.title}"`);
    root.style.setProperty('--print-app-name', `"${APP_NAME}"`);
  }, [headerState.header]);

  if (headerState.isLoading || viewModel.isLoading) {
    return (
      <section className="grid min-h-[40vh] place-items-center" aria-busy="true">
        <LoadingSpinner label="Loading master plan…" />
      </section>
    );
  }

  if (headerState.isError || headerState.header == null) {
    return (
      <Alert variant="destructive" role="alert">
        <p>{headerState.error ?? 'Event details could not be loaded.'}</p>
      </Alert>
    );
  }

  return (
    <section className="grid gap-8">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Master plan"
        subtitle="Operational summary for transport, contacts, costs, and itinerary."
      />

      <MasterPlanHeader header={headerState.header} />

      <GoogleMapsPlanningProvider>
        <MasterPlanJourneyMap
          mapData={viewModel.mapData}
          isLoading={viewModel.isLogisticsLoading}
          isError={viewModel.isError}
          errorMessage={viewModel.error instanceof Error ? viewModel.error.message : null}
          embeddedMaps
        />

        <MasterPlanContactsList
          contacts={contactsState.contacts}
          isLoading={contactsState.isLoading}
          isError={contactsState.error != null}
          errorMessage={contactsState.error}
        />

        <MasterPlanCostSummary
          rollup={costState.rollup}
          isLoading={costState.isLoading}
          isError={costState.isError}
          errorMessage={costState.error}
        />

        <MasterPlanItinerarySection
          model={viewModel.itineraryModel}
          timezoneIana={viewModel.timezoneIana}
          canLinkToPlanning={canReadPlanning}
          isLoading={viewModel.isLogisticsLoading}
          isError={viewModel.isError}
          errorMessage={viewModel.error instanceof Error ? viewModel.error.message : null}
          embeddedMaps
        />
      </GoogleMapsPlanningProvider>
    </section>
  );
}
