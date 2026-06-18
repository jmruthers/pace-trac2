import { useQuery } from '@tanstack/react-query';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import { risksTable } from '@/features/risks/supabase-risks-client';

const TRAC_LANDING_OPEN_RISKS_QUERY_KEY = 'trac-landing-open-risks';

export function useTracLandingOpenRisks(eventIds: readonly string[]) {
  const secureSupabase = useSecureSupabase();

  return useQuery({
    queryKey: [TRAC_LANDING_OPEN_RISKS_QUERY_KEY, eventIds],
    enabled: secureSupabase != null && eventIds.length > 0,
    queryFn: async (): Promise<Map<string, number>> => {
      if (secureSupabase == null) {
        throw new Error('Secure Supabase client not available');
      }

      const { data, error } = await risksTable(secureSupabase)
        .select('event_id')
        .neq('status', 'Complete');

      if (error != null) {
        throw new Error(error.message);
      }

      const allowedIds = new Set(eventIds);
      const counts = new Map<string, number>();
      for (const row of data ?? []) {
        const eventId = String(row.event_id);
        if (!allowedIds.has(eventId)) continue;
        counts.set(eventId, (counts.get(eventId) ?? 0) + 1);
      }
      return counts;
    },
    staleTime: 30_000,
    retry: 1,
  });
}
