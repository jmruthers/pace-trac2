import { DashboardCard } from '@/features/dashboard/components/DashboardCard';

export function JournalSummaryCard() {
  return (
    <DashboardCard
      title="Journal"
      viewHref="/journal"
      viewLabel="Open journal"
      isLoading={false}
      isError={false}
      errorMessage={null}
      onRetry={() => undefined}
    >
      <p>Chronological posts and images for this event.</p>
    </DashboardCard>
  );
}
