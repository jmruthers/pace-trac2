import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { AssignmentsContent } from '@/features/assignments/AssignmentsContent';

/** SLICE-04 — participant assignments at `/assignments`. */
export function AssignmentsPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.planning}
      operation="read"
      fallback={<AccessDenied />}
    >
      <main>
        <AssignmentsContent />
      </main>
    </PagePermissionGuard>
  );
}
