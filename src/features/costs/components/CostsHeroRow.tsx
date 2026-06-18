import { computeAveragePerParticipant, formatCostAmount } from '@/features/costs/currency-format';
import type { CostRollupResult } from '@/features/costs/types';

export function CostsHeroRow({ rollup }: { rollup: CostRollupResult }) {
  const averagePerApproved = computeAveragePerParticipant(
    rollup.eventTotalBase,
    rollup.approvedParticipantCount
  );

  const foreignCurrencyLineCount = rollup.rowBreakdowns.filter(
    (row) => row.currency != null && row.currency !== rollup.baseCurrency
  ).length;

  return (
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Cost summary">
      <article>
        <h2>Total event cost</h2>
        <p>{formatCostAmount(rollup.eventTotalBase, rollup.baseCurrency)}</p>
      </article>
      <article>
        <h2>Per participant</h2>
        <p>{formatCostAmount(averagePerApproved, rollup.baseCurrency)}</p>
      </article>
      <article>
        <h2>Foreign currency lines</h2>
        <p>{foreignCurrencyLineCount}</p>
      </article>
    </section>
  );
}
