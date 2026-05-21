import { TRAC_DASHBOARD_QUERY_PREFIX } from '@/features/planning/query-keys';

export { TRAC_DASHBOARD_QUERY_PREFIX };

export const dashboardQueryKeys = {
  all: TRAC_DASHBOARD_QUERY_PREFIX,
  header: (eventId: string) => [...TRAC_DASHBOARD_QUERY_PREFIX, 'header', eventId] as const,
};
