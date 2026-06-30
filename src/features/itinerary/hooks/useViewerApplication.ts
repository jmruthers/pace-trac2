import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuthContext } from '@solvera/pace-core';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import { err, isErr, ok, type ApiResult } from '@solvera/pace-core/types';
import { itineraryQueryKeys } from '@/features/itinerary/query-keys';
import { useItineraryScope } from '@/features/itinerary/hooks/useItineraryScope';
import { asItineraryClient } from '@/features/itinerary/supabase-helpers';
import type { ViewerApplication } from '@/features/itinerary/types';

function normalizeViewerApplication(row: Record<string, unknown>): ViewerApplication {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    status: String(row.status),
  };
}

/** Participant path: RLS-scoped table read (Option A — applicant sees own row only). */
async function resolveApplicantApplicationViaRls(
  secureSupabase: NonNullable<ReturnType<typeof asItineraryClient>>,
  eventId: string
): Promise<ApiResult<ViewerApplication | null>> {
  const { data, error } = await secureSupabase
    .from('base_application')
    .select('id, event_id, status')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error != null) {
    return err({
      code: 'VIEWER_APPLICATION_LOOKUP_FAILED',
      message: error.message,
    });
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (row == null || typeof row !== 'object') {
    return ok(null);
  }

  return ok(normalizeViewerApplication(row as Record<string, unknown>));
}

/**
 * Dual-role planner path: session-bound RPC avoids listing all event applications
 * when the caller holds read:page.applications.
 */
async function resolveApplicantApplicationViaSessionRpc(
  secureSupabase: NonNullable<ReturnType<typeof asItineraryClient>>,
  eventId: string
): Promise<ApiResult<ViewerApplication | null>> {
  const { data, error } = await secureSupabase.rpc('base_application_for_viewer', {
    p_event_id: eventId,
  });
  if (error != null) {
    return err({
      code: 'VIEWER_APPLICATION_LOOKUP_FAILED',
      message: error.message,
    });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (row == null || typeof row !== 'object') {
    return ok(null);
  }

  return ok(normalizeViewerApplication(row as Record<string, unknown>));
}

export interface UseViewerApplicationOptions {
  /** When false, skips the query entirely. Defaults to true. */
  enabled?: boolean;
  /** When true, never surfaces loading state (dual-role lookup after first paint). */
  nonBlocking?: boolean;
}

/** Event-scoped application for the signed-in viewer when they are the applicant. */
export function useViewerApplication(options: UseViewerApplicationOptions = {}) {
  const { enabled: enabledOption = true, nonBlocking = false } = options;
  const secureSupabase = asItineraryClient(useSecureSupabase());
  const { user } = useUnifiedAuthContext();
  const { eventId, isReady } = useItineraryScope();
  const userId = user?.id ?? null;
  const useSessionRpc = nonBlocking;

  const enabled = enabledOption && Boolean(secureSupabase && isReady && eventId && userId);

  const query = useQuery({
    queryKey: itineraryQueryKeys.viewerApplication(
      eventId ?? '',
      userId ?? '',
      useSessionRpc ? 'session_rpc' : 'rls_table'
    ),
    enabled,
    queryFn: async (): Promise<ViewerApplication | null> => {
      if (!secureSupabase || !eventId) return null;

      const result = useSessionRpc
        ? await resolveApplicantApplicationViaSessionRpc(secureSupabase, eventId)
        : await resolveApplicantApplicationViaRls(secureSupabase, eventId);

      if (isErr(result)) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 30_000,
  });

  return {
    application: query.data ?? null,
    isLoading: !nonBlocking && enabled && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
