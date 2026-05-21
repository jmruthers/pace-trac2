import { describe, expect, it } from 'vitest';
import { formatItineraryDateRangeLabel } from '@/features/dashboard/format-itinerary-range';

describe('formatItineraryDateRangeLabel', () => {
  it('returns null when range is null', () => {
    expect(formatItineraryDateRangeLabel(null)).toBeNull();
  });

  it('returns single day key when start equals end', () => {
    expect(
      formatItineraryDateRangeLabel({ startDayKey: '2026-05-01', endDayKey: '2026-05-01' })
    ).toBe('2026-05-01');
  });

  it('returns start – end when range spans multiple days', () => {
    expect(
      formatItineraryDateRangeLabel({ startDayKey: '2026-05-01', endDayKey: '2026-05-04' })
    ).toBe('2026-05-01 – 2026-05-04');
  });
});
