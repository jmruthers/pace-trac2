import { LoadingSpinner } from '@solvera/pace-core/components';
import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { DashboardContent } from '@/features/dashboard/DashboardContent';

/** SLICE-02 — event dashboard at `/` and `/dashboard`. */
export function DashboardPage() {
  return (
    <PagePermissionGuard
      pageName="dashboard"
      operation="read"
      loading={
        <main className="grid min-h-[50vh] place-items-center px-4" aria-busy="true">
          <LoadingSpinner label="Checking access…" />
        </main>
      }
      fallback={<AccessDenied />}
    >
      <DashboardContent />
    </PagePermissionGuard>
  );
}
