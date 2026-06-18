import { useMemo } from 'react';
import { AttentionSection } from '@solvera/pace-core/components';
import type { EventStub } from '@solvera/pace-core/types';
import { buildTracLandingAttentionItems } from '@/app/pages/landing/lib/trac-landing-attention-items';

export interface TracLandingAttentionSectionProps {
  events: readonly EventStub[];
  openRiskCountByEventId: ReadonlyMap<string, number>;
  onSelectEventAndNavigateRisks: (event: EventStub) => void;
}

export function TracLandingAttentionSection({
  events,
  openRiskCountByEventId,
  onSelectEventAndNavigateRisks,
}: TracLandingAttentionSectionProps) {
  const items = useMemo(
    () =>
      buildTracLandingAttentionItems({
        events,
        openRiskCountByEventId,
        onSelectEventAndNavigateRisks,
      }),
    [events, onSelectEventAndNavigateRisks, openRiskCountByEventId]
  );

  return <AttentionSection items={items} />;
}
