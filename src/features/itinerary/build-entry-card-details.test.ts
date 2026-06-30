import { describe, expect, it } from 'vitest';
import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';
import {
  buildEntryDetailLines,
  buildEntryTimeColumn,
  buildEntryTitle,
  formatEntryTimeRange,
} from '@/features/itinerary/build-entry-card-details';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

const transportEntry: DerivedItineraryDayEntry = {
  dayKey: '2026-06-01',
  localDate: '2026-06-01',
  resourceType: 'transport',
  resourceId: 'transport-1',
  entryKind: 'departure',
  orderingTimestamp: '2026-06-01T08:00:00.000Z',
  orderingEpochMs: 0,
  sortCategory: 'timestamp',
  timezone: 'Australia/Sydney',
  timezoneSource: 'departure_timezone',
};

const baseDisplayFields = {
  notes: null,
  bookingReference: null,
  currency: null,
  individualCost: null,
  groupCost: null,
  capacity: null,
};

const transportDisplay: ItineraryResourceDisplay = {
  resourceType: 'transport',
  resourceId: 'transport-1',
  title: 'Flight — TR100',
  subtitle: 'Sydney → London',
  coords: [],
  status: 'confirmed',
  ...baseDisplayFields,
  transportMode: 'Flight',
  transportNumber: 'TR100',
  departureLabel: 'Sydney',
  arrivalLabel: 'London',
  endTime: '2026-06-02T14:00:00.000Z',
  startTimezone: 'Australia/Sydney',
  endTimezone: 'Europe/London',
};

describe('formatEntryTimeRange', () => {
  it('joins start and end times on one row for transport', () => {
    const label = formatEntryTimeRange(transportEntry, transportDisplay);
    expect(label).toMatch(/^\d{2}:\d{2}–\d{2}:\d{2}$/);
    expect(label).not.toContain('\n');
  });

  it('shows em dash for occupied accommodation without clock times', () => {
    const entry: DerivedItineraryDayEntry = {
      ...transportEntry,
      resourceType: 'accommodation',
      resourceId: 'acc-1',
      entryKind: 'occupied',
    };
    const display: ItineraryResourceDisplay = {
      resourceType: 'accommodation',
      resourceId: 'acc-1',
      title: 'Hotel',
      subtitle: 'Main St',
      coords: [],
      status: null,
      ...baseDisplayFields,
      checkInTime: '2026-06-01T14:00:00.000Z',
      checkOutTime: '2026-06-03T10:00:00.000Z',
    };
    expect(formatEntryTimeRange(entry, display)).toBe('—');
  });
});

describe('buildEntryTimeColumn', () => {
  it('shows time-only labels when start and end share a local calendar day', () => {
    const sameDayDisplay: ItineraryResourceDisplay = {
      ...transportDisplay,
      endTime: '2026-06-01T08:00:00.000Z',
      startTimezone: 'Australia/Sydney',
      endTimezone: 'Australia/Sydney',
    };
    const sameDayEntry: DerivedItineraryDayEntry = {
      ...transportEntry,
      orderingTimestamp: '2026-06-01T00:00:00.000Z',
    };
    const column = buildEntryTimeColumn(sameDayEntry, sameDayDisplay);
    expect(column.startTime).toMatch(/^\d{2}:\d{2}$/);
    expect(column.endTime).toMatch(/^\d{2}:\d{2}$/);
  });

  it('shows full datetime when departure and arrival fall on different local days', () => {
    const column = buildEntryTimeColumn(transportEntry, transportDisplay);
    expect(column.startTime).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    expect(column.endTime).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    expect(column.startTimezoneLabel).toContain('Sydney');
    expect(column.endTimezoneLabel).toContain('London');
  });
});

describe('buildEntryTitle', () => {
  it('omits resource type prefix from transport title', () => {
    expect(buildEntryTitle(transportEntry, transportDisplay, false)).toBe('Flight — TR100');
  });

  it('prefixes participant view with Your', () => {
    expect(buildEntryTitle(transportEntry, transportDisplay, true)).toBe('Your Flight — TR100');
  });
});

describe('buildEntryDetailLines', () => {
  it('shows route without arrival time suffix', () => {
    const lines = buildEntryDetailLines(transportEntry, transportDisplay);
    const route = lines.find((line) => line.id === 'route');
    expect(route?.text).toBe('Sydney → London');
    expect(route?.text).not.toMatch(/arrive/i);
  });

  it('includes booking reference, cost, capacity, and notes when set', () => {
    const display: ItineraryResourceDisplay = {
      ...transportDisplay,
      bookingReference: 'ABC123',
      currency: 'USD',
      individualCost: 120,
      capacity: 40,
      notes: 'Window seat requested',
    };
    const lines = buildEntryDetailLines(transportEntry, display);
    expect(lines.map((line) => line.text)).toContain('Sydney → London');
    expect(lines.map((line) => line.text)).toContain('Booking reference: ABC123');
    expect(lines.map((line) => line.text)).toContain('Capacity: 40');
    expect(lines.map((line) => line.text)).toContain('Window seat requested');
    expect(lines.some((line) => line.text.startsWith('Per person: '))).toBe(true);
  });

  it('skips accommodation location when venue is in title', () => {
    const entry: DerivedItineraryDayEntry = {
      ...transportEntry,
      resourceType: 'accommodation',
      resourceId: 'acc-1',
      entryKind: 'occupied',
    };
    const display: ItineraryResourceDisplay = {
      resourceType: 'accommodation',
      resourceId: 'acc-1',
      title: 'Meininger Krakow',
      subtitle: 'MEININGER Kraków Centrum',
      coords: [],
      status: null,
      ...baseDisplayFields,
      checkInTime: '2026-06-01T14:00:00.000Z',
      checkOutTime: '2026-06-03T10:00:00.000Z',
    };
    const lines = buildEntryDetailLines(entry, display);
    expect(lines.find((line) => line.id === 'route')).toBeUndefined();
  });
});
