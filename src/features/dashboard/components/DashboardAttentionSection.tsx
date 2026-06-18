import { useMemo } from 'react';
import { AttentionSection } from '@solvera/pace-core/components';
import { useDashboardPlanningCounts } from '@/features/dashboard/hooks/useDashboardPlanningCounts';
import { useRisks } from '@/features/risks/hooks/use-risks';

export function DashboardAttentionSection() {
  const { transport, accommodation, activity } = useDashboardPlanningCounts();
  const { risks } = useRisks();

  const items = useMemo(() => {
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

    const openRisks = risks.filter((risk) => risk.status !== 'Complete').length;
    if (openRisks > 0) {
      attention.push({
        id: 'open-risks',
        title: 'Open risks',
        kind: 'Risks',
        sub: `${openRisks} risk${openRisks === 1 ? '' : 's'} not complete`,
        href: '/risks',
        tone: 'warn',
      });
    }

    return attention;
  }, [activity, accommodation, risks, transport]);

  return <AttentionSection items={items} />;
}
