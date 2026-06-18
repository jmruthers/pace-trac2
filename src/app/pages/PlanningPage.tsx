import { PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { PlanningPageContent } from '@/features/planning/components/PlanningPageContent';
import { GoogleMapsPlanningProvider } from '@/features/planning/context/GoogleMapsPlanningContext';

export function PlanningPage() {
  return (
    <main>
      <PagePermissionGuard pageName={TRAC_PAGE_NAMES.planning} operation="read">
        <GoogleMapsPlanningProvider>
          <PlanningPageContent />
        </GoogleMapsPlanningProvider>
      </PagePermissionGuard>
    </main>
  );
}
