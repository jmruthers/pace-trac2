import { useMemo, useCallback } from 'react';
import {
  summarizePlanningStatusCounts,
  type PlanningStatusSummary,
} from '@/features/dashboard/planning-status-summary';
import type { LogisticsResourceKind } from '@/features/planning/types';
import {
  useTransportList,
  useAccommodationList,
  useActivityList,
} from '@/features/planning/hooks/useLogisticsList';

export interface DashboardPlanningCountsState {
  transport: PlanningStatusSummary;
  accommodation: PlanningStatusSummary;
  activity: PlanningStatusSummary;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDashboardPlanningCounts(): DashboardPlanningCountsState {
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();

  const transportSummary = useMemo(
    () => summarizePlanningStatusCounts(transport.items),
    [transport.items]
  );
  const accommodationSummary = useMemo(
    () => summarizePlanningStatusCounts(accommodation.items),
    [accommodation.items]
  );
  const activitySummary = useMemo(
    () => summarizePlanningStatusCounts(activity.items),
    [activity.items]
  );

  const isLoading = transport.isLoading || accommodation.isLoading || activity.isLoading;
  const isError = transport.isError || accommodation.isError || activity.isError;
  const error =
    (transport.error as Error | null) ??
    (accommodation.error as Error | null) ??
    (activity.error as Error | null) ??
    null;

  const refetch = useCallback(() => {
    void transport.refetch();
    void accommodation.refetch();
    void activity.refetch();
  }, [transport, accommodation, activity]);

  return {
    transport: transportSummary,
    accommodation: accommodationSummary,
    activity: activitySummary,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export const PLANNING_KIND_LABELS: Record<LogisticsResourceKind, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activity: 'Activities',
};
