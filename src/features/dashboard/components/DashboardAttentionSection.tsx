import { useMemo } from 'react';
import { AttentionSection } from '@solvera/pace-core/components';
import type { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';

type DashboardSummaryState = ReturnType<typeof useDashboardSummary>;

interface DashboardAttentionSectionProps {
  summaryState: DashboardSummaryState;
}

export function DashboardAttentionSection({ summaryState }: DashboardAttentionSectionProps) {
  const { summary, isLoading } = summaryState;

  const items = useMemo(() => {
    if (isLoading || summary == null) {
      return [];
    }

    const { transport, accommodation, activity } = summary.planning;
    const attention: Array<{
      id: string;
      title: string;
      kind: string;
      sub: string;
      href: string;
      tone?: 'warn' | 'info';
    }> = [];

    const unconfirmedTotal =
      transport.total -
      transport.confirmed +
      accommodation.total -
      accommodation.confirmed +
      activity.total -
      activity.confirmed;

    if (unconfirmedTotal > 0) {
      attention.push({
        id: 'planning-unconfirmed',
        title: 'Logistics to confirm',
        kind: 'Planning',
        sub: `${unconfirmedTotal} planning row${unconfirmedTotal === 1 ? '' : 's'} not confirmed`,
        href: '/planning',
        tone: 'warn',
      });
    }

    if (summary.openRisks > 0) {
      attention.push({
        id: 'open-risks',
        title: 'Open risks',
        kind: 'Risks',
        sub: `${summary.openRisks} risk${summary.openRisks === 1 ? '' : 's'} not complete`,
        href: '/risks',
        tone: 'warn',
      });
    }

    return attention;
  }, [isLoading, summary]);

  return <AttentionSection items={items} />;
}
