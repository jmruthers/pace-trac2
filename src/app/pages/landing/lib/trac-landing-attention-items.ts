import type { AttentionSectionItem } from '@solvera/pace-core/components';
import type { EventStub } from '@solvera/pace-core/types';
import { readEventName } from '@/app/pages/landing/lib/event-tile-helpers';

export function buildTracLandingAttentionItems(input: {
  events: readonly EventStub[];
  openRiskCountByEventId: ReadonlyMap<string, number>;
  onSelectEventAndNavigateRisks: (event: EventStub) => void;
}): AttentionSectionItem[] {
  const items: AttentionSectionItem[] = [];

  for (const event of input.events) {
    const open = input.openRiskCountByEventId.get(event.id) ?? 0;
    if (open <= 0) continue;

    const title = readEventName(event);
    items.push({
      id: `trac-risk-${event.id}`,
      title,
      sub: `${open} open risk${open === 1 ? '' : 's'} to treat`,
      tone: 'warn',
      kind: 'Risks',
      onClick: () => input.onSelectEventAndNavigateRisks(event),
    });
  }

  return items;
}
