import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { PlanningPageContent } from '@/features/planning/components/PlanningPageContent';
import { GoogleMapsPlanningProvider } from '@/features/planning/context/GoogleMapsPlanningContext';

/** SLICE-03 — event planning at `/planning`. */
export function PlanningPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.planning}
      operation="read"
      fallback={<AccessDenied />}
    >
      <main>
        <GoogleMapsPlanningProvider>
          <PlanningPageContent />
        </GoogleMapsPlanningProvider>
      </main>
    </PagePermissionGuard>
  );
}
