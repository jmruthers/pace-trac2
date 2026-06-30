import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEvents, useOptionalEvents } from '@solvera/pace-core/hooks';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import type { FileReference } from '@solvera/pace-core/types';
import {
  readEventCode,
  readEventDate,
  readEventDays,
} from '@/app/pages/landing/lib/event-tile-helpers';
import { useBaseCurrency } from '@/features/costs/hooks/useBaseCurrency';
import { useApprovedApplications } from '@/features/assignments/hooks/useApprovedApplications';
import { asDashboardReadClient } from '@/features/dashboard/supabase-dashboard-read-client';
import { formatEventDateRange } from '@/features/master-plan/format-event-date-range';
import { TRAC_MASTERPLAN_QUERY_PREFIX } from '@/features/planning/query-keys';

export interface MasterPlanEventHeader {
  eventId: string;
  eventCode: string;
  title: string;
  tagline: string | null;
  logoFileReference: FileReference | null;
  dateRangeLabel: string;
  organisationName: string | null;
  approvedParticipantCount: number;
  baseCurrency: string | null;
}

interface CoreEventRow {
  event_name: string | null;
  description: string | null;
  participant_blurb: string | null;
  logo_id: string | null;
  logo: Record<string, unknown> | Record<string, unknown>[] | null;
  organisation:
    | { name: string | null; display_name: string | null }
    | { name: string | null; display_name: string | null }[]
    | null;
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

function resolveEndDateIso(startIso: string | null, days: number | null): string | null {
  if (startIso == null || days == null || days <= 1) return null;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(start.getDate() + (days - 1));
  return end.toISOString();
}

export function useMasterPlanEventHeader() {
  const { selectedEvent, isLoading: eventsLoading } = useEvents();
  const { selectedEvent: optionalEvent } = useOptionalEvents();
  const secureSupabase = asDashboardReadClient(useSecureSupabase());
  const eventId = selectedEvent?.id ?? null;
  const { baseCurrency, isLoading: baseCurrencyLoading } = useBaseCurrency();
  const { applications, isLoading: applicationsLoading } = useApprovedApplications();

  const query = useQuery({
    queryKey: [...TRAC_MASTERPLAN_QUERY_PREFIX, 'header', eventId ?? ''],
    enabled: Boolean(secureSupabase && eventId),
    queryFn: async (): Promise<Omit<MasterPlanEventHeader, 'approvedParticipantCount' | 'baseCurrency'>> => {
      if (!secureSupabase || !eventId) {
        throw new Error('Event context not available');
      }

      const { data: eventRow, error: eventError } = await secureSupabase
        .from('core_events')
        .select(
          'event_name, description, participant_blurb, logo_id, logo:core_file_references!logo_id(id, table_name, record_id, file_path, file_metadata, app_id, is_public, created_at, updated_at), organisation:core_organisations!organisation_id(name, display_name)'
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
      const description = row.description?.trim();
      const blurb = row.participant_blurb?.trim();
      const tagline = description || blurb || null;

      const embedded = row.logo;
      const fileRow = embedded == null ? null : Array.isArray(embedded) ? embedded[0] : embedded;
      const logoFileReference =
        fileRow != null && typeof fileRow === 'object'
          ? mapFileReference(fileRow as Record<string, unknown>)
          : null;

      const orgEmbedded = row.organisation;
      const orgRow = orgEmbedded == null ? null : Array.isArray(orgEmbedded) ? orgEmbedded[0] : orgEmbedded;
      const displayName =
        orgRow != null && typeof orgRow === 'object' && typeof orgRow.display_name === 'string'
          ? orgRow.display_name.trim()
          : '';
      const legalName =
        orgRow != null && typeof orgRow === 'object' && typeof orgRow.name === 'string'
          ? orgRow.name.trim()
          : '';
      const organisationName = displayName !== '' ? displayName : legalName !== '' ? legalName : null;

      const startIso = readEventDate(optionalEvent);
      const days = readEventDays(optionalEvent);
      const endIso = resolveEndDateIso(startIso, days);

      return {
        eventId,
        eventCode: readEventCode(optionalEvent),
        title,
        tagline,
        logoFileReference,
        dateRangeLabel: formatEventDateRange(startIso, endIso),
        organisationName,
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

  const header: MasterPlanEventHeader | null = useMemo(() => {
    if (query.data == null) return null;
    return {
      ...query.data,
      approvedParticipantCount: applications.length,
      baseCurrency: baseCurrency ?? null,
    };
  }, [applications.length, baseCurrency, query.data]);

  return {
    header,
    isLoading: eventsLoading || query.isLoading || baseCurrencyLoading || applicationsLoading,
    isError: query.isError,
    error: errorMessage,
    refetch: query.refetch,
  };
}
