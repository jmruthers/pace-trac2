import { useMemo } from 'react';
import { collectMapData } from '@/features/itinerary/collect-map-points';
import { buildItineraryModel } from '@/features/itinerary/build-itinerary-model';
import { useItineraryEventTimezone } from '@/features/itinerary/hooks/useItineraryEventTimezone';
import {
  buildDisplayByResourceKey,
  mapAssignmentsToItineraryInput,
  mapLogisticsToItineraryResources,
} from '@/features/itinerary/map-logistics-to-itinerary-input';
import type { ItineraryMapData } from '@/features/itinerary/collect-map-points';
import type { ItineraryModel } from '@/features/itinerary/types';
import { useEventAssignments } from '@/features/itinerary/hooks/useEventAssignments';
import {
  useAccommodationList,
  useActivityList,
  useTransportList,
} from '@/features/planning/hooks/useLogisticsList';
import { usePlanningScope } from '@/features/planning/hooks/usePlanningScope';

const EMPTY_MAP_DATA: ItineraryMapData = { points: [], transportLegs: [] };

export function useMasterPlanViewModel() {
  const { isReady, isLoading: scopeLoading } = usePlanningScope();
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();
  const eventAssignments = useEventAssignments();
  const { ianaTimezone } = useItineraryEventTimezone();

  const logisticsLoading =
    transport.isLoading ||
    accommodation.isLoading ||
    activity.isLoading ||
    eventAssignments.isLoading;

  const isLogisticsLoading = isReady && logisticsLoading;

  const isError =
    transport.isError ||
    accommodation.isError ||
    activity.isError ||
    eventAssignments.isError;

  const error =
    transport.error ??
    accommodation.error ??
    activity.error ??
    eventAssignments.error ??
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
    () => mapAssignmentsToItineraryInput(eventAssignments.assignments),
    [eventAssignments.assignments]
  );

  const itineraryModel: ItineraryModel | null = useMemo(() => {
    if (isLogisticsLoading) return null;

    return buildItineraryModel({
      resources,
      assignments: assignmentInputs,
      scope: { mode: 'all' },
      eventDefaultTimezone: ianaTimezone,
      displayByResourceKey,
      notesByResourceKey: {},
    });
  }, [
    assignmentInputs,
    displayByResourceKey,
    ianaTimezone,
    isLogisticsLoading,
    resources,
  ]);

  const mapData: ItineraryMapData = useMemo(() => {
    if (itineraryModel == null) return EMPTY_MAP_DATA;
    return collectMapData(itineraryModel.dayGroups, itineraryModel.displayByResourceKey);
  }, [itineraryModel]);

  return {
    mapData,
    itineraryModel,
    timezoneIana: ianaTimezone,
    isLoading: scopeLoading,
    isLogisticsLoading,
    isError,
    error,
    transportItems: transport.items,
  };
}
