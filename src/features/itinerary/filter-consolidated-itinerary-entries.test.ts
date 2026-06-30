import { describe, expect, it } from 'vitest';
import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';
import {
  filterConsolidatedItineraryEntries,
  shouldShowConsolidatedItineraryEntry,
} from '@/features/itinerary/filter-consolidated-itinerary-entries';

const baseEntry: DerivedItineraryDayEntry = {
  dayKey: '2026-06-01',
  localDate: '2026-06-01',
  resourceType: 'transport',
  resourceId: 't1',
  entryKind: 'departure',
  orderingTimestamp: '2026-06-01T08:00:00.000Z',
  orderingEpochMs: 0,
  sortCategory: 'timestamp',
  timezone: 'Australia/Melbourne',
  timezoneSource: 'departure_timezone',
};

describe('filterConsolidatedItineraryEntries', () => {
  it('keeps departure and hides arrival for cross-day transport', () => {
    const arrival: DerivedItineraryDayEntry = {
      ...baseEntry,
      dayKey: '2026-06-02',
      localDate: '2026-06-02',
      entryKind: 'arrival',
      orderingTimestamp: '2026-06-02T05:35:00.000Z',
      timezone: 'Europe/Warsaw',
      timezoneSource: 'arrival_timezone',
    };

    expect(shouldShowConsolidatedItineraryEntry(baseEntry)).toBe(true);
    expect(shouldShowConsolidatedItineraryEntry(arrival)).toBe(false);
    expect(filterConsolidatedItineraryEntries([baseEntry, arrival])).toEqual([baseEntry]);
  });

  it('keeps finish when activity ends on a different day', () => {
    const finish: DerivedItineraryDayEntry = {
      ...baseEntry,
      resourceType: 'activity',
      resourceId: 'a1',
      entryKind: 'finish',
    };
    expect(shouldShowConsolidatedItineraryEntry(finish)).toBe(false);
  });
});
