import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEvents } from '@solvera/pace-core/hooks';
import type { FileReference } from '@solvera/pace-core/types';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import { dashboardQueryKeys } from '@/features/dashboard/dashboard-query-keys';
import { asDashboardReadClient } from '@/features/dashboard/supabase-dashboard-read-client';
import type { DashboardEventHeader } from '@/features/dashboard/types';

interface CoreEventRow {
  event_name: string | null;
  description: string | null;
  participant_blurb: string | null;
  logo_id: string | null;
  logo: Record<string, unknown> | Record<string, unknown>[] | null;
}

function mapFileReference(row: Record<string, unknown>): FileReference {
  const metadata = row.file_metadata;
  return {
    id: String(row.id),
    table_name: String(row.table_name),
    record_id: String(row.record_id),
    file_path: String(row.file_path),
    file_metadata:
      metadata != null && typeof metadata === 'object'
        ? (metadata as FileReference['file_metadata'])
        : { fileName: '', fileType: '', bucket: 'files' },
    app_id: String(row.app_id ?? ''),
    is_public: Boolean(row.is_public),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function resolveTagline(row: CoreEventRow): string | null {
  const description = row.description?.trim();
  if (description) return description;
  const blurb = row.participant_blurb?.trim();
  return blurb || null;
}

function resolveLogoFileReference(row: CoreEventRow): FileReference | null {
  const embedded = row.logo;
  if (embedded == null) return null;
  const fileRow = Array.isArray(embedded) ? embedded[0] : embedded;
  if (fileRow == null || typeof fileRow !== 'object') return null;
  return mapFileReference(fileRow as Record<string, unknown>);
}

export function useDashboardEventHeader() {
  const { selectedEvent, isLoading: eventsLoading } = useEvents();
  const secureSupabase = asDashboardReadClient(useSecureSupabase());
  const eventId = selectedEvent?.id ?? null;

  const query = useQuery({
    queryKey: dashboardQueryKeys.header(eventId ?? ''),
    enabled: Boolean(secureSupabase && eventId),
    queryFn: async (): Promise<DashboardEventHeader> => {
      if (!secureSupabase || !eventId) {
        throw new Error('Event context not available');
      }

      const { data: eventRow, error: eventError } = await secureSupabase
        .from('core_events')
        .select(
          'event_name, description, participant_blurb, logo_id, logo:core_file_references!logo_id(id, table_name, record_id, file_path, file_metadata, app_id, is_public, created_at, updated_at)'
        )
        .eq('event_id', eventId)
        .maybeSingle();

      if (eventError != null) {
        throw new Error(eventError.message);
      }

      if (eventRow == null) {
        throw new Error('Event metadata could not be loaded');
      }

      const row = eventRow as unknown as CoreEventRow;
      const contextName =
        typeof selectedEvent?.name === 'string' ? selectedEvent.name.trim() : '';
      const title = row.event_name?.trim() || contextName || 'Event';

      return {
        eventId,
        title,
        tagline: resolveTagline(row),
        logoFileReference: resolveLogoFileReference(row),
      };
    },
    staleTime: 60_000,
    retry: 1,
  });

  const errorMessage = useMemo(() => {
    if (query.error instanceof Error) return query.error.message;
    if (query.error != null) return String(query.error);
    return null;
  }, [query.error]);

  return {
    header: query.data ?? null,
    isLoading: eventsLoading || query.isLoading,
    isError: query.isError,
    error: errorMessage,
    refetch: query.refetch,
  };
}
