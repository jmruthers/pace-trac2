import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { useDashboardContactsCount } from '@/features/dashboard/hooks/useDashboardContactsCount';

export function ContactsSummaryCard() {
  const { count, isLoading, isError, error, refetch } = useDashboardContactsCount();

  return (
    <DashboardCard
      title="Contacts"
      viewHref="/contacts"
      viewLabel="Open contacts"
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message ?? null}
      onRetry={refetch}
      emptyMessage={count === 0 ? 'No contacts for this event yet.' : undefined}
    >
      {count > 0 ? (
        <p>
          <strong>{count}</strong> contact{count === 1 ? '' : 's'}
        </p>
      ) : null}
    </DashboardCard>
  );
}
