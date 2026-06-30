import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { MasterPlanContent } from '@/features/master-plan/MasterPlanContent';

/** SLICE-10 — read-only operational composite at `/masterplan`. */
export function MasterPlanPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.masterplan}
      operation="read"
      fallback={<AccessDenied />}
    >
      <main>
        <MasterPlanContent />
      </main>
    </PagePermissionGuard>
  );
}
