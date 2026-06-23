import { useMemo } from 'react';
import { usePageCan } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { usePlanningScope } from '@/features/planning/hooks/usePlanningScope';
import { useViewerApplication } from '@/features/itinerary/hooks/useViewerApplication';
import type { ItineraryAudienceMode } from '@/features/itinerary/types';

export function useItineraryAudience() {
  const { organisationId } = usePlanningScope();
  const { can: canReadPlanning, isLoading: planningPermissionLoading } = usePageCan(
    TRAC_PAGE_NAMES.planning,
    'read',
  );
  const {
    application,
    isLoading: applicationLoading,
    isError: applicationError,
    error: applicationQueryError,
  } = useViewerApplication();

  const mode: ItineraryAudienceMode = useMemo(() => {
    if (canReadPlanning && application != null) return 'dual';
    if (canReadPlanning) return 'planner';
    if (application != null) return 'participant';
    return 'day_visitor';
  }, [canReadPlanning, application]);

  /**
   * `usePageCan` keeps `isLoading` true while RBAC scope is unresolved and can remain
   * true indefinitely when organisation id is missing. Only block on planning permission
   * once organisation scope exists.
   */
  const isPlanningPermissionPending =
    organisationId != null && planningPermissionLoading;

  const isAudiencePending = useMemo(() => {
    if (canReadPlanning) return false;
    return isPlanningPermissionPending || applicationLoading;
  }, [canReadPlanning, isPlanningPermissionPending, applicationLoading]);

  return {
    mode,
    canReadPlanning,
    participantApplicationId: application?.id ?? null,
    isPlanningPermissionPending,
    isApplicationPending: applicationLoading,
    isAudiencePending,
    isLoading: isAudiencePending,
    isError: applicationError,
    error: applicationQueryError,
  };
}
