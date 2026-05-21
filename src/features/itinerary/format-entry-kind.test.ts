import { describe, expect, it } from 'vitest';
import { formatOrderingTime, isSameLocalDay } from '@/features/itinerary/format-entry-kind';

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
    const hourInZone = (timeZone: string) =>
      Number(
        new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: 'numeric',
          hour12: false,
        }).format(new Date(iso))
      );
    expect(hourInZone('Europe/London')).toBe(10);
    expect(hourInZone('Australia/Sydney')).toBe(19);
    expect(formatOrderingTime(iso, 'Europe/London')).not.toBe(
      formatOrderingTime(iso, 'Australia/Sydney')
    );
  });

  it('formatOrderingTime returns empty string for null', () => {
    expect(formatOrderingTime(null)).toBe('');
  });
});
