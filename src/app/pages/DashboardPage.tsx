import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { DashboardContent } from '@/features/dashboard/DashboardContent';

/** SLICE-02 — event dashboard at `/` and `/dashboard`. */
export function DashboardPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.dashboard}
      operation="read"
      fallback={<AccessDenied />}
    >
      <DashboardContent />
    </PagePermissionGuard>
  );
}
