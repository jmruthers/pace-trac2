import { useMemo } from 'react';
import { buildNotesByResourceKey } from '@/features/itinerary/build-assignment-notes';
import { buildItineraryModel } from '@/features/itinerary/build-itinerary-model';
import { useItineraryAudience } from '@/features/itinerary/hooks/useItineraryAudience';
import type { useEventAssignments } from '@/features/itinerary/hooks/useEventAssignments';
import {
  buildDisplayByResourceKey,
  mapAssignmentsToItineraryInput,
  mapLogisticsToItineraryResources,
} from '@/features/itinerary/map-logistics-to-itinerary-input';
import type { ItineraryModel } from '@/features/itinerary/types';
import {
  useAccommodationList,
  useActivityList,
  useTransportList,
} from '@/features/planning/hooks/useLogisticsList';
import { usePlanningScope } from '@/features/planning/hooks/usePlanningScope';

export type EventAssignmentsResult = ReturnType<typeof useEventAssignments>;

export interface UseItineraryViewModelOptions {
  eventDefaultTimezone?: string | null;
  eventAssignments: EventAssignmentsResult;
}

export function useItineraryViewModel(options: UseItineraryViewModelOptions) {
  const { eventDefaultTimezone = null, eventAssignments } = options;

  const { isReady, isLoading: scopeLoading } = usePlanningScope();
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();
  const {
    assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorObj,
  } = eventAssignments;
  const audience = useItineraryAudience();

  const logisticsCoreLoading =
    transport.isLoading || accommodation.isLoading || activity.isLoading;

  const logisticsLoading = logisticsCoreLoading || assignmentsLoading;

  const isLoading = scopeLoading;
  const isLogisticsLoading = isReady && logisticsLoading;

  const isError =
    transport.isError ||
    accommodation.isError ||
    activity.isError ||
    assignmentsError ||
    audience.isError;

  const error =
    transport.error ??
    accommodation.error ??
    activity.error ??
    assignmentsErrorObj ??
    audience.error ??
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

  const participantApplicationId = audience.participantApplicationId;

  const notesByResourceKey = useMemo(
    () => buildNotesByResourceKey(assignments, participantApplicationId),
    [assignments, participantApplicationId]
  );

  const model: ItineraryModel | null = useMemo(() => {
    if (audience.mode === 'day_visitor') return null;

    if (participantApplicationId == null) {
      return {
        dayGroups: [],
        visibleDateRange: null,
        displayByResourceKey,
        skippedResources: [],
        notesByResourceKey: {},
      };
    }

    if (isLogisticsLoading) return null;

    return buildItineraryModel({
      resources,
      assignments: assignmentInputs,
      scope: { mode: 'participant', participantApplicationId },
      eventDefaultTimezone,
      displayByResourceKey,
      notesByResourceKey,
    });
  }, [
    assignmentInputs,
    audience.mode,
    displayByResourceKey,
    eventDefaultTimezone,
    isLogisticsLoading,
    notesByResourceKey,
    participantApplicationId,
    resources,
  ]);

  return {
    audience,
    model,
    participantApplicationId,
    assignments,
    isLoading,
    isLogisticsLoading,
    isError,
    error,
    transportItems: transport.items,
    accommodationItems: accommodation.items,
    activityItems: activity.items,
  };
}
