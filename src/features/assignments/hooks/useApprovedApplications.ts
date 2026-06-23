import { useQuery } from '@tanstack/react-query';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import { assignmentsQueryKeys } from '@/features/assignments/query-keys';
import { useAssignmentsScope } from '@/features/assignments/hooks/useAssignmentsScope';
import { asAssignmentsClient } from '@/features/assignments/supabase-helpers';
import type { ApprovedApplication } from '@/features/assignments/types';

const APPROVED_STATUS = 'approved';

function extractPersonFields(row: Record<string, unknown>): Pick<
  ApprovedApplication,
  'first_name' | 'surname' | 'preferred_name'
> {
  const rawPerson = row.core_person;
  const person = Array.isArray(rawPerson) ? rawPerson[0] : rawPerson;
  if (person != null && typeof person === 'object') {
    const p = person as Record<string, unknown>;
    return {
      first_name: typeof p.first_name === 'string' ? p.first_name : null,
      surname: typeof p.last_name === 'string' ? p.last_name : null,
      preferred_name: typeof p.preferred_name === 'string' ? p.preferred_name : null,
    };
  }

  return {
    first_name: typeof row.first_name === 'string' ? row.first_name : null,
    surname: typeof row.surname === 'string' ? row.surname : null,
    preferred_name: null,
  };
}

function normalizeApplication(row: Record<string, unknown>): ApprovedApplication {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    status: String(row.status),
    ...extractPersonFields(row),
  };
}

export function useApprovedApplications() {
  const secureSupabase = asAssignmentsClient(useSecureSupabase());
  const { eventId, isReady } = useAssignmentsScope();

  const query = useQuery({
    queryKey: assignmentsQueryKeys.approvedApplications(eventId ?? ''),
    enabled: Boolean(secureSupabase && isReady && eventId),
    queryFn: async (): Promise<ApprovedApplication[]> => {
      if (!secureSupabase || !eventId) return [];
      const { data, error } = await secureSupabase
        .from('base_application')
        .select('id, event_id, status, core_person!inner(first_name, last_name, preferred_name)')
        .eq('event_id', eventId)
        .eq('status', APPROVED_STATUS)
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? [])
        .map(normalizeApplication)
        .sort((a, b) => {
          const bySurname = (a.surname ?? '').localeCompare(b.surname ?? '');
          if (bySurname !== 0) return bySurname;
          return (a.first_name ?? '').localeCompare(b.first_name ?? '');
        });
    },
    staleTime: 30_000,
  });

  return {
    applications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
