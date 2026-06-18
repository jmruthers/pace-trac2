import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { TracEventsLandingSection } from '@/app/pages/landing/TracEventsLandingSection';

/** TR01 — authenticated home event picker at `/`. */
export function TracEventsLandingPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.dashboard}
      operation="read"
      fallback={<AccessDenied />}
    >
      <TracEventsLandingSection />
    </PagePermissionGuard>
  );
}
