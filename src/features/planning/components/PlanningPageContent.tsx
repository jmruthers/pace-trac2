import { PageHeader } from '@solvera/pace-core/components';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { PlanningTable } from '@/features/planning/components/PlanningTable';

export function PlanningPageContent() {
  const breadcrumbItems = useTracEventBreadcrumbs('Planning');

  return (
    <section className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Planning"
        subtitle="Manage transport, accommodation, and activities for the selected event. Location addresses are saved as point-in-time snapshots on each row."
      />
      <PlanningTable />
    </section>
  );
}
