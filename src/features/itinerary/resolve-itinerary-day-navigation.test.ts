import { describe, expect, it } from 'vitest';
import {
  clampDayKey,
  dayIndexInRange,
  enumerateDayKeysInRange,
  resolveDefaultItineraryDayKey,
  shiftDayKey,
  todayDayKey,
} from '@/features/itinerary/resolve-itinerary-day-navigation';

const range = { startDayKey: '2026-06-01', endDayKey: '2026-06-05' };

describe('enumerateDayKeysInRange', () => {
  it('lists every calendar day inclusive', () => {
    expect(enumerateDayKeysInRange(range)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
    ]);
  });

  it('returns a single day when start equals end', () => {
    expect(
      enumerateDayKeysInRange({ startDayKey: '2026-06-03', endDayKey: '2026-06-03' })
    ).toEqual(['2026-06-03']);
  });
});

describe('resolveDefaultItineraryDayKey', () => {
  it('uses first day with entries when today is before the range', () => {
    expect(
      resolveDefaultItineraryDayKey({ range, todayKey: '2026-05-15' })
    ).toBe('2026-06-01');
  });

  it('uses today when today is inside the range', () => {
    expect(
      resolveDefaultItineraryDayKey({ range, todayKey: '2026-06-03' })
    ).toBe('2026-06-03');
  });

  it('clamps to end when today is after the range', () => {
    expect(
      resolveDefaultItineraryDayKey({ range, todayKey: '2026-07-01' })
    ).toBe('2026-06-05');
  });
});

describe('clampDayKey', () => {
  it('clamps below start and above end', () => {
    expect(clampDayKey('2026-05-01', range)).toBe('2026-06-01');
    expect(clampDayKey('2026-07-01', range)).toBe('2026-06-05');
    expect(clampDayKey('2026-06-03', range)).toBe('2026-06-03');
  });
});

describe('shiftDayKey', () => {
  it('moves one calendar day forward and back', () => {
    expect(shiftDayKey('2026-06-03', 1)).toBe('2026-06-04');
    expect(shiftDayKey('2026-06-03', -1)).toBe('2026-06-02');
  });
});

describe('dayIndexInRange', () => {
  it('returns zero-based index for a day key in range', () => {
    expect(dayIndexInRange('2026-06-01', range)).toBe(0);
    expect(dayIndexInRange('2026-06-05', range)).toBe(4);
    expect(dayIndexInRange('2026-06-10', range)).toBe(-1);
  });
});

describe('todayDayKey', () => {
  it('returns yyyy-MM-dd format', () => {
    expect(todayDayKey('UTC')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
