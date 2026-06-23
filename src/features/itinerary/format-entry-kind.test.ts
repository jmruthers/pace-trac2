import { describe, expect, it } from 'vitest';
import { formatDateTime } from '@solvera/pace-core/utils';
import {
  formatEntryTimeShort,
  formatEntryTimezoneLabel,
  formatOrderingTime,
  getAccommodationCardTitle,
  isSameLocalDay,
  localDayKey,
} from '@/features/itinerary/format-entry-kind';

describe('format-entry-kind', () => {
  it('isSameLocalDay returns true for same calendar day in timezone', () => {
    expect(
      isSameLocalDay('2026-06-03T09:00:00.000Z', '2026-06-03T21:00:00.000Z', 'Europe/London')
    ).toBe(true);
  });

  it('isSameLocalDay returns false across different days', () => {
    expect(
      isSameLocalDay('2026-06-03T09:00:00.000Z', '2026-06-04T09:00:00.000Z', 'Europe/London')
    ).toBe(false);
  });

  it('formatOrderingTime uses entry timezone when provided', () => {
    const iso = '2026-06-03T09:00:00.000Z';
    expect(formatOrderingTime(iso, 'Europe/London')).not.toBe(
      formatOrderingTime(iso, 'Australia/Sydney')
    );
  });

  it('formatOrderingTime without timezone uses formatDateTime', () => {
    const iso = '2026-06-03T09:00:00.000Z';
    expect(formatOrderingTime(iso)).toBe(formatDateTime(iso));
  });

  it('formatOrderingTime returns empty string for null', () => {
    expect(formatOrderingTime(null)).toBe('');
  });

  it('formatEntryTimeShort without timezone uses formatTime in user zone', () => {
    const iso = '2026-06-03T09:00:00.000Z';
    const formatted = formatEntryTimeShort(iso);
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });

  it('formatEntryTimeShort with timezone differs across zones', () => {
    const iso = '2026-06-03T09:00:00.000Z';
    expect(formatEntryTimeShort(iso, 'Europe/London')).not.toBe(
      formatEntryTimeShort(iso, 'Australia/Sydney')
    );
  });

  it('formatEntryTimezoneLabel includes IANA id and offset', () => {
    const label = formatEntryTimezoneLabel('UTC');
    expect(label).toContain('UTC');
  });

  it('localDayKey returns YYYY-MM-DD in timezone', () => {
    expect(localDayKey('2026-06-03T09:00:00.000Z', 'Europe/London')).toBe('2026-06-03');
  });

  it('getAccommodationCardTitle includes venue name for each entry kind', () => {
    expect(getAccommodationCardTitle('check-in', 'Harbour Hotel')).toBe(
      'Check in at Harbour Hotel'
    );
    expect(getAccommodationCardTitle('check-out', 'Harbour Hotel')).toBe(
      'Check out from Harbour Hotel'
    );
    expect(getAccommodationCardTitle('occupied', 'Harbour Hotel')).toBe(
      'Staying at Harbour Hotel'
    );
  });
});
