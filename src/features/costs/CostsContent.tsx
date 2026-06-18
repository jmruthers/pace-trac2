import { Link } from 'react-router-dom';
import { Alert, LoadingSpinner, PageHeader } from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { CostsBreakdownTable } from '@/features/costs/components/CostsBreakdownTable';
import { CostsByTypeCard } from '@/features/costs/components/CostsByTypeCard';
import { CostsHeroRow } from '@/features/costs/components/CostsHeroRow';
import { CostsParticipantTable } from '@/features/costs/components/CostsParticipantTable';
import { CostsSummary } from '@/features/costs/components/CostsSummary';
import { useCostRollupData } from '@/features/costs/hooks/useCostRollupData';

export function CostsContent() {
  usePaceMain({ printTitle: 'Costs' });
  const breadcrumbItems = useTracEventBreadcrumbs('Costs');

  const { rollup, isLoading, isError, error } = useCostRollupData();

  const headerActions = (
    <Link to="/currency-rates">Currency rates</Link>
  );

  if (isLoading) {
    return (
      <main className="grid min-h-[50vh] place-items-center px-4" aria-busy="true">
        <LoadingSpinner label="Loading costs…" />
      </main>
    );
  }

  return (
    <main className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Costs"
        subtitle="Event totals from transport, accommodation, and activity logistics rows. Amounts convert to your organisation base currency using rates on the currency rates page."
        actions={headerActions}
      />
      {isError && error != null ? (
        <Alert variant="destructive" role="alert">
          <p>{error}</p>
        </Alert>
      ) : null}
      {rollup != null && !isError ? (
        <>
          <CostsHeroRow rollup={rollup} />
          <CostsByTypeCard rollup={rollup} />
          <CostsSummary rollup={rollup} />
          <CostsParticipantTable rollup={rollup} />
          {rollup.rowBreakdowns.length === 0 ? (
            <p>No logistics rows with cost data for this event yet.</p>
          ) : (
            <>
              <CostsBreakdownTable rollup={rollup} />
              <p>
                Row totals use individual cost plus group cost divided by assigned count per
                resource (R2 allocation). See the per-participant table for allocated totals.
              </p>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
