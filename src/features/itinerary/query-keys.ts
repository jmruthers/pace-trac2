import { TRAC_ITINERARY_QUERY_PREFIX } from '@/features/planning/query-keys';

export const itineraryQueryKeys = {
  all: TRAC_ITINERARY_QUERY_PREFIX,
  event: (eventId: string) => [...TRAC_ITINERARY_QUERY_PREFIX, eventId] as const,
  assignments: (eventId: string) => [...TRAC_ITINERARY_QUERY_PREFIX, eventId, 'assignments'] as const,
  viewerApplication: (eventId: string, userId: string, lookup: 'rls_table' | 'session_rpc') =>
    [...TRAC_ITINERARY_QUERY_PREFIX, eventId, 'viewer-application', userId, lookup] as const,
};
