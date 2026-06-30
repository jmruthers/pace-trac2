import { describe, it, expect } from 'vitest';
import { computeCostRollup } from '@/features/costs/cost-rollup';
import { mapTracDashboardSummary } from '@/features/dashboard/lib/dashboard-summary-mapper';

describe('mapTracDashboardSummary', () => {
  it('maps RPC JSON into dashboard summary shape', () => {
    const raw = {
      event_id: 'event-1',
      base_currency: 'USD',
      planning: {
        transport: { confirmed: 1, total: 2 },
        accommodation: { confirmed: 0, total: 1 },
        activity: { confirmed: 2, total: 2 },
      },
      open_risks: 1,
      contacts_count: 3,
      approved_participant_count: 2,
      currency_rates: [{ currency_code: 'USD', exchange_rate: 1 }],
      cost_lines: {
        transport: [
          {
            id: 't1',
            currency: 'USD',
            individual_cost: 100,
            group_cost: 0,
            departure_display_name: 'A',
            arrival_display_name: 'B',
          },
        ],
        accommodation: [],
        activity: [],
      },
      itinerary: {
        transport: [
          {
            id: 't1',
            departure_time: '2026-05-01T08:00:00Z',
            arrival_time: '2026-05-01T12:00:00Z',
            departure_timezone: 'UTC',
            arrival_timezone: 'UTC',
          },
        ],
        accommodation: [],
        activity: [],
      },
      assignments: [],
    };

    const summary = mapTracDashboardSummary(raw, 'event-1');

    expect(summary.eventId).toBe('event-1');
    expect(summary.planning.transport).toEqual({ confirmed: 1, total: 2 });
    expect(summary.openRisks).toBe(1);
    expect(summary.contactsCount).toBe(3);
    expect(summary.rollup.baseCurrency).toBe('USD');
    expect(summary.rollup.eventTotalBase).toBe(
      computeCostRollup({
        baseCurrency: 'USD',
        approvedParticipantCount: 2,
        rates: [{ currency_code: 'USD', exchange_rate: 1 }],
        assignments: [],
        lines: [
          {
            resourceType: 'transport',
            resourceId: 't1',
            currency: 'USD',
            individual_cost: 100,
            group_cost: 0,
            label: 'A → B',
          },
        ],
      }).eventTotalBase
    );
    expect(summary.visibleDateRange).not.toBeNull();
  });
});
