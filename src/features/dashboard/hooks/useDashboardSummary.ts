import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEvents } from '@solvera/pace-core/hooks';
import type { ItineraryVisibleDateRange } from '@solvera/pace-core/itinerary';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import type { CostRollupResult } from '@/features/costs/types';
import { dashboardQueryKeys } from '@/features/dashboard/dashboard-query-keys';
import { asDashboardReadClient } from '@/features/dashboard/supabase-dashboard-read-client';
import { mapTracDashboardSummary } from '@/features/dashboard/lib/dashboard-summary-mapper';
import type { PlanningStatusSummary } from '@/features/dashboard/planning-status-summary';

export interface DashboardSummary {
  eventId: string;
  planning: {
    transport: PlanningStatusSummary;
    accommodation: PlanningStatusSummary;
    activity: PlanningStatusSummary;
  };
  visibleDateRange: ItineraryVisibleDateRange | null;
  rollup: CostRollupResult;
  openRisks: number;
  contactsCount: number;
}

export function useDashboardSummary() {
  const { selectedEvent, isLoading: eventsLoading } = useEvents();
  const secureSupabase = asDashboardReadClient(useSecureSupabase());
  const eventId = selectedEvent?.id ?? null;

  const enabled = Boolean(secureSupabase && eventId);

  const query = useQuery({
    queryKey: dashboardQueryKeys.summary(eventId ?? ''),
    enabled,
    staleTime: 30_000,
    retry: 1,
    queryFn: async (): Promise<DashboardSummary> => {
      if (!secureSupabase || !eventId) {
        throw new Error('Dashboard summary prerequisites not available');
      }

      const { data, error } = await secureSupabase.rpc('data_trac_dashboard_summary', {
        p_event_id: eventId,
      });

      if (error != null) {
        throw new Error(error.message);
      }

      return mapTracDashboardSummary(data, eventId);
    },
  });

  const errorMessage = useMemo(() => {
    if (query.error instanceof Error) return query.error.message;
    if (query.error != null) return String(query.error);
    return null;
  }, [query.error]);

  return {
    summary: query.data ?? null,
    isLoading: eventsLoading || query.isLoading,
    isError: query.isError,
    error: errorMessage,
    refetch: query.refetch,
  };
}
