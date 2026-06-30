import { describe, it, expect } from 'vitest';
import { collectTransportJourneyMapData } from '@/features/master-plan/collect-transport-journey-map';
import type { TransportRow } from '@/features/planning/types';

const base: Omit<TransportRow, 'id' | 'departure_time' | 'arrival_time' | 'mode'> = {
  event_id: 'event-1',
  organisation_id: 'org-1',
  status: 'planned',
  notes: null,
  booking_reference: null,
  currency: null,
  individual_cost: null,
  group_cost: null,
  capacity: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  created_by: null,
  updated_by: null,
  transport_number: 'TR100',
  departure_place_id: null,
  departure_display_name: 'Sydney',
  departure_short_address: null,
  departure_coords: null,
  departure_timezone: null,
  arrival_place_id: null,
  arrival_display_name: 'London',
  arrival_short_address: null,
  arrival_coords: null,
  arrival_timezone: null,
};

describe('collectTransportJourneyMapData', () => {
  it('sorts active transport by departure and skips dropped rows', () => {
    const legs = collectTransportJourneyMapData([
      {
        ...base,
        id: 'late',
        mode: 'Bus',
        departure_time: '2026-06-03T08:00:00.000Z',
        arrival_time: '2026-06-03T18:00:00.000Z',
      },
      {
        ...base,
        id: 'early',
        mode: 'Flight',
        departure_time: '2026-06-01T08:00:00.000Z',
        arrival_time: '2026-06-02T14:00:00.000Z',
      },
      {
        ...base,
        id: 'dropped',
        mode: 'Train',
        status: 'dropped',
        departure_time: '2026-06-02T08:00:00.000Z',
        arrival_time: '2026-06-02T18:00:00.000Z',
      },
    ]);

    expect(legs.map((leg) => leg.resourceId)).toEqual(['early', 'late']);
    expect(legs[0]?.transportNumber).toBe('TR100');
  });
});
