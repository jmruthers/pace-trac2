import { useMemo } from 'react';
import type { ItineraryScope } from '@solvera/pace-core/itinerary';
import { buildNotesByResourceKey } from '@/features/itinerary/build-assignment-notes';
import { buildItineraryModel } from '@/features/itinerary/build-itinerary-model';
import { useItineraryAudience } from '@/features/itinerary/hooks/useItineraryAudience';
import { useEventAssignments } from '@/features/itinerary/hooks/useEventAssignments';
import {
  buildDisplayByResourceKey,
  mapAssignmentsToItineraryInput,
  mapLogisticsToItineraryResources,
} from '@/features/itinerary/map-logistics-to-itinerary-input';
import type { ItineraryModel, ItineraryViewMode } from '@/features/itinerary/types';
import {
  useAccommodationList,
  useActivityList,
  useTransportList,
} from '@/features/planning/hooks/useLogisticsList';
import { usePlanningScope } from '@/features/planning/hooks/usePlanningScope';

export interface UseItineraryViewModelOptions {
  viewMode: ItineraryViewMode;
  /** Selected participant application for participant view; required when viewMode is participant. */
  participantApplicationId: string | null;
  eventDefaultTimezone?: string | null;
}

function scopeForView(
  viewMode: ItineraryViewMode,
  participantApplicationId: string | null
): ItineraryScope | undefined {
  if (viewMode === 'participant' && participantApplicationId != null) {
    return { mode: 'participant', participantApplicationId };
  }
  return { mode: 'all' };
}

/** @deprecated Use ItineraryViewMode */
export type ItineraryViewTab = 'event' | 'personal';

export function useItineraryViewModel(options: UseItineraryViewModelOptions) {
  const { viewMode, participantApplicationId, eventDefaultTimezone = null } = options;

  const { isReady, isLoading: scopeLoading } = usePlanningScope();
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();
  const { assignments, isLoading: assignmentsLoading, isError: assignmentsError, error: assignmentsErrorObj } =
    useEventAssignments();
  const audience = useItineraryAudience();

  const logisticsLoading =
    transport.isLoading ||
    accommodation.isLoading ||
    activity.isLoading ||
    assignmentsLoading;

  const isLoading = scopeLoading || (isReady && logisticsLoading);

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

  const effectiveViewMode: ItineraryViewMode = useMemo(() => {
    if (audience.mode === 'participant') return 'participant';
    return viewMode;
  }, [audience.mode, viewMode]);

  const effectiveParticipantId = useMemo(() => {
    if (audience.mode === 'participant') {
      return audience.participantApplicationId;
    }
    if (effectiveViewMode === 'participant') {
      return participantApplicationId;
    }
    return null;
  }, [audience.mode, audience.participantApplicationId, effectiveViewMode, participantApplicationId]);

  const notesByResourceKey = useMemo(
    () =>
      effectiveViewMode === 'participant'
        ? buildNotesByResourceKey(assignments, effectiveParticipantId)
        : {},
    [assignments, effectiveParticipantId, effectiveViewMode]
  );

  const model: ItineraryModel | null = useMemo(() => {
    if (audience.mode === 'day_visitor') return null;

    if (effectiveViewMode === 'participant' && effectiveParticipantId == null) {
      return {
        dayGroups: [],
        visibleDateRange: null,
        displayByResourceKey,
        skippedResources: [],
        notesByResourceKey: {},
      };
    }

    const scope = scopeForView(effectiveViewMode, effectiveParticipantId);

    return buildItineraryModel({
      resources,
      assignments: assignmentInputs,
      scope,
      eventDefaultTimezone,
      displayByResourceKey,
      notesByResourceKey,
    });
  }, [
    assignmentInputs,
    audience.mode,
    displayByResourceKey,
    effectiveParticipantId,
    effectiveViewMode,
    eventDefaultTimezone,
    notesByResourceKey,
    resources,
  ]);

  return {
    audience,
    model,
    effectiveViewMode,
    effectiveParticipantId,
    assignments,
    isLoading,
    isError,
    error,
    transportItems: transport.items,
    accommodationItems: accommodation.items,
    activityItems: activity.items,
  };
}
