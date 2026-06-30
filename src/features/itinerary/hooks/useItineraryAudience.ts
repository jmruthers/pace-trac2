import { useMemo } from 'react';
import { useViewerApplication } from '@/features/itinerary/hooks/useViewerApplication';
import type { ItineraryAudienceMode } from '@/features/itinerary/types';

export function useItineraryAudience() {
  const {
    application,
    isLoading: applicationLoading,
    isError: applicationError,
    error: applicationQueryError,
  } = useViewerApplication();

  const mode: ItineraryAudienceMode = useMemo(() => {
    if (application != null) return 'participant';
    return 'day_visitor';
  }, [application]);

  const isAudiencePending = applicationLoading;

  return {
    mode,
    participantApplicationId: application?.id ?? null,
    isApplicationPending: applicationLoading,
    isAudiencePending,
    isLoading: isAudiencePending,
    isError: applicationError,
    error: applicationQueryError ?? null,
  };
}
