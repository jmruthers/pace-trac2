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

  it('orders visible upcoming events ascending by date', () => {
    const ordered = orderTracLandingEvents(events);
    expect(ordered.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('places upcoming events before past events (landing contract)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-28T12:00:00'));
    try {
      const mixed: EventStub[] = [
        { id: 'cuboree', event_name: 'Cuboree 2026', event_date: '2026-04-01', is_visible: true },
        { id: 'wsj', event_name: 'WSJ 2027', event_date: '2027-01-08', is_visible: true },
      ];
      const ordered = orderTracLandingEvents(mixed);
      expect(ordered.map((event) => event.id)).toEqual(['wsj', 'cuboree']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('slices visible events for show-more toggle', () => {
    const ordered = Array.from({ length: 5 }, (_, index) => ({
      id: `evt-${index}`,
      event_date: `2026-${String(index + 1).padStart(2, '0')}-01`,
      is_visible: true,
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
