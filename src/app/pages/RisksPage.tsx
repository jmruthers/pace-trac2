import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { RisksContent } from '@/features/risks/RisksContent';

/** SLICE-09 — event risk register at `/risks`. */
export function RisksPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.risks}
      operation="read"
      fallback={<AccessDenied />}
    >
      <RisksContent />
    </PagePermissionGuard>
  );
}
