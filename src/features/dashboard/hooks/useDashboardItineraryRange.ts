import { useMemo, useCallback } from 'react';
import { buildItineraryModel } from '@/features/itinerary/build-itinerary-model';
import { useEventAssignments } from '@/features/itinerary/hooks/useEventAssignments';
import {
  buildDisplayByResourceKey,
  mapAssignmentsToItineraryInput,
  mapLogisticsToItineraryResources,
} from '@/features/itinerary/map-logistics-to-itinerary-input';
import {
  useTransportList,
  useAccommodationList,
  useActivityList,
} from '@/features/planning/hooks/useLogisticsList';

export function useDashboardItineraryRange() {
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();
  const {
    assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorObj,
    refetch: refetchAssignments,
  } = useEventAssignments();

  const isLoading =
    transport.isLoading ||
    accommodation.isLoading ||
    activity.isLoading ||
    assignmentsLoading;

  const isError =
    transport.isError ||
    accommodation.isError ||
    activity.isError ||
    assignmentsError;

  const error =
    (transport.error as Error | null) ??
    (accommodation.error as Error | null) ??
    (activity.error as Error | null) ??
    (assignmentsErrorObj as Error | null) ??
    null;

  const resources = useMemo(
    () =>
      mapLogisticsToItineraryResources({
        transport: transport.items,
        accommodation: accommodation.items,
        activity: activity.items,
      }),
    [transport.items, accommodation.items, activity.items]
  );

  const displayByResourceKey = useMemo(
    () =>
      buildDisplayByResourceKey({
        transport: transport.items,
        accommodation: accommodation.items,
        activity: activity.items,
      }),
    [transport.items, accommodation.items, activity.items]
  );

  const assignmentInputs = useMemo(
    () => mapAssignmentsToItineraryInput(assignments),
    [assignments]
  );

  const visibleDateRange = useMemo(() => {
    const model = buildItineraryModel({
      resources,
      assignments: assignmentInputs,
      scope: { mode: 'all' },
      eventDefaultTimezone: null,
      displayByResourceKey,
    });
    return model.visibleDateRange;
  }, [resources, assignmentInputs, displayByResourceKey]);

  const refetch = useCallback(() => {
    void transport.refetch();
    void accommodation.refetch();
    void activity.refetch();
    void refetchAssignments();
  }, [transport, accommodation, activity, refetchAssignments]);

  return {
    visibleDateRange,
    isLoading,
    isError,
    error,
    refetch,
  };
}
