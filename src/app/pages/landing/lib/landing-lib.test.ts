import { describe, it, expect, vi } from 'vitest';
import type { EventStub } from '@solvera/pace-core/types';
import { buildTracLandingAttentionItems } from '@/app/pages/landing/lib/trac-landing-attention-items';
import {
  orderTracLandingEvents,
  shouldShowTracEventsToggle,
  sliceVisibleTracEvents,
} from '@/app/pages/landing/lib/order-trac-events';

describe('order-trac-events', () => {
  const events: EventStub[] = [
    { id: 'b', event_date: '2026-10-01', is_visible: true },
    { id: 'a', event_date: '2026-08-01', is_visible: true },
    { id: 'hidden', event_date: '2026-09-01', is_visible: false },
  ];

  it('orders visible events by date', () => {
    const ordered = orderTracLandingEvents(events);
    expect(ordered.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('slices visible events for show-more toggle', () => {
    const ordered = Array.from({ length: 5 }, (_, index) => ({
      id: `evt-${index}`,
      event_date: `2026-${String(index + 1).padStart(2, '0')}-01`,
    }));
    expect(shouldShowTracEventsToggle(ordered.length)).toBe(true);
    expect(sliceVisibleTracEvents(ordered, false).length).toBe(4);
    expect(sliceVisibleTracEvents(ordered, true).length).toBe(5);
  });
});

describe('trac-landing-attention-items', () => {
  it('maps open risk counts to attention rows', () => {
    const events: EventStub[] = [{ id: 'evt-1', event_name: 'Summit' }];
    const items = buildTracLandingAttentionItems({
      events,
      openRiskCountByEventId: new Map([['evt-1', 2]]),
      onSelectEventAndNavigateRisks: vi.fn(),
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Summit');
    expect(items[0]?.sub).toBe('2 open risks to treat');
  });
});
