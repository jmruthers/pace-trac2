import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';

export function useDashboardContactsCount() {
  const { summary, isLoading, isError, error, refetch } = useDashboardSummary();

  return {
    count: summary?.contactsCount ?? 0,
    isLoading,
    isError,
    error: error != null ? new Error(error) : null,
    refetch,
  };
}
