import { describe, expect, it } from 'vitest';
import {
  buildPlanningTableRows,
  countPlanningRowsByKind,
  filterPlanningTableRows,
} from '@/features/planning/planning-table-rows';
import { UNDATED_DAY_KEY } from '@/features/planning/planning-format';
import type { AccommodationRow, ActivityRow, TransportRow } from '@/features/planning/types';

const baseRow = {
  event_id: 'evt-1',
  organisation_id: 'org-1',
  status: 'planned' as const,
  notes: null,
  booking_reference: null,
  currency: null,
  individual_cost: null,
  group_cost: null,
  capacity: 10,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  created_by: null,
  updated_by: null,
};

const transport: TransportRow = {
  ...baseRow,
  id: 't-1',
  mode: 'Flight',
  transport_number: 'QF1',
  departure_time: '2026-06-10T08:00:00Z',
  arrival_time: '2026-06-10T12:00:00Z',
  departure_place_id: null,
  departure_display_name: 'Sydney',
  departure_short_address: null,
  departure_coords: null,
  departure_timezone: null,
  arrival_place_id: null,
  arrival_display_name: 'Melbourne',
  arrival_short_address: null,
  arrival_coords: null,
  arrival_timezone: null,
};

const accommodation: AccommodationRow = {
  ...baseRow,
  id: 'a-1',
  name: 'Hotel Alpha',
  check_in_time: '2026-06-11T15:00:00Z',
  check_out_time: '2026-06-12T10:00:00Z',
  location_place_id: null,
  location_display_name: 'CBD',
  location_short_address: null,
  location_coords: null,
  location_timezone: null,
};

const activity: ActivityRow = {
  ...baseRow,
  id: 'act-1',
  name: 'Opening ceremony',
  start_time: 'invalid-date',
  finish_time: '2026-06-12T18:00:00Z',
  start_location_place_id: null,
  start_location_display_name: 'Arena',
  start_location_short_address: null,
  start_location_coords: null,
  start_location_timezone: null,
  finish_location_place_id: null,
  finish_location_display_name: 'Arena',
  finish_location_short_address: null,
  finish_location_coords: null,
  finish_location_timezone: null,
};

describe('planning-table-rows', () => {
  it('maps rows with day keys and puts undated last', () => {
    const rows = buildPlanningTableRows({
      transport: [transport],
      accommodation: [accommodation],
      activity: [activity],
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]?.kind).toBe('transport');
    expect(rows[0]?.startDayKey).toBe('2026-06-10');
    expect(rows[1]?.kind).toBe('accommodation');
    expect(rows[2]?.kind).toBe('activity');
    expect(rows[2]?.startDayKey).toBe(UNDATED_DAY_KEY);
    expect(rows[2]?.startDayLabel).toBe('Undated');
  });

  it('filters by kind', () => {
    const rows = buildPlanningTableRows({
      transport: [transport],
      accommodation: [accommodation],
      activity: [],
    });

    expect(filterPlanningTableRows(rows, 'transport')).toHaveLength(1);
    expect(filterPlanningTableRows(rows, 'all')).toHaveLength(2);
  });

  it('counts rows by kind', () => {
    const rows = buildPlanningTableRows({
      transport: [transport],
      accommodation: [accommodation],
      activity: [activity],
    });

    expect(countPlanningRowsByKind(rows)).toEqual({
      all: 3,
      transport: 1,
      accommodation: 1,
      activity: 1,
    });
  });
});
