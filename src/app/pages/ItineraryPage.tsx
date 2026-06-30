import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { ItineraryContent } from '@/features/itinerary/ItineraryContent';

/** SLICE-05 — person-aware read-only itinerary at `/itinerary`. */
export function ItineraryPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.itinerary}
      operation="read"
      fallback={<AccessDenied />}
    >
      <main>
        <ItineraryContent />
      </main>
    </PagePermissionGuard>
  );
}
