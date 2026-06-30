import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { CostsContent } from '@/features/costs/CostsContent';

/** SLICE-07 — event cost rollups at `/costs`. */
export function CostsPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.costs}
      operation="read"
      fallback={<AccessDenied />}
    >
      <CostsContent />
    </PagePermissionGuard>
  );
}
